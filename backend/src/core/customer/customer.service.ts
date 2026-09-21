import { sendEmail } from "../api/resend.ts";
import {
    dbGetBookingByBookingSecret,
    dbUpdateBooking,
    type Booking,
    type CreateBooking,
} from "../bookings/bookings.dba.ts";
import { createBooking } from "../bookings/bookings.service.ts";
import { dbGetOpeningHoursByDay } from "../opening-hours/opening-hours.dba.ts";
import { dbGetSettings } from "../settings/settings.dba.ts";
import { ConflictError, NotFoundError } from "../../errors.ts";
import { customerBookingMessages } from "../../error-messages.ts";
import { withTransaction } from "../../db-utils.ts";
import {
    dbGetTableBookingRows,
    type TableBookingRow,
    type TableBookingRowsFilters,
} from "./customer.dba.ts";

export interface SlotRequest {
    date: string;
    pax: number;
}

export interface AvailableSlots {
    tableGroupId: number;
    tableGroupName: string;
    availableStartTimes: number[];
}

interface BookedSlot {
    start: number;
    end: number;
}

type TableMap = Map<number, BookedSlot[]>;
type GroupMap = Map<number, { groupName: string; tableMap: TableMap }>;

export function getAvailableSlots(slotRequest: SlotRequest): AvailableSlots[] {
    const openingHours = dbGetOpeningHoursByDay(
        Temporal.PlainDate.from(slotRequest.date).dayOfWeek % 7,
    );
    const { booking_duration } = dbGetSettings();
    if (!openingHours || openingHours.is_closed) {
        return [];
    }

    const tableBookingRows = dbGetTableBookingRows(slotRequest);
    const groupMap = createGroupMap(tableBookingRows);

    const result = [];
    const interval = 15;

    for (const [groupId, { groupName, tableMap }] of groupMap) {
        const availableStartTimes = [];
        for (
            let slotStart = openingHours.opening_time;
            slotStart <= openingHours.closing_time - booking_duration;
            slotStart += interval
        ) {
            const slotEnd = slotStart + booking_duration;

            let isAnyTableFree = false;
            for (const bookedSlots of tableMap.values()) {
                if (isTableFree(bookedSlots, slotStart, slotEnd)) {
                    isAnyTableFree = true;
                    break;
                }
            }

            if (isAnyTableFree) {
                availableStartTimes.push(slotStart);
            }
        }

        result.push({
            tableGroupId: groupId,
            tableGroupName: groupName,
            availableStartTimes: availableStartTimes,
        });
    }

    return result;
}

function createGroupMap(tableBookingRows: TableBookingRow[]): GroupMap {
    const groupMap: GroupMap = new Map();

    for (const row of tableBookingRows) {
        const groupId = row.table_group_id;
        const groupName = row.table_group_name;

        if (!groupMap.has(groupId)) {
            groupMap.set(groupId, {
                groupName,
                tableMap: new Map(),
            });
        }

        const { tableMap } = groupMap.get(groupId)!;
        const tableId = row.table_id;

        if (!tableMap.has(tableId)) {
            tableMap.set(tableId, []);
        }

        if (row.start_time !== null && row.end_time !== null) {
            tableMap.get(tableId)!.push({
                start: row.start_time,
                end: row.end_time,
            });
        }
    }

    return groupMap;
}

// if (slotStart,slotEnd) intersects any blokedSlot in the array, then it's not free
function isTableFree(
    bookedSlots: BookedSlot[],
    slotStart: number,
    slotEnd: number,
): boolean {
    return !bookedSlots.some(
        (bookedSlot) =>
            slotStart < bookedSlot.end && slotEnd > bookedSlot.start,
    );
}

function assignTableId(
    slotRequest: SlotRequest,
    tableGroupId: number,
    slotStart: number,
): number | null {
    const { booking_duration } = dbGetSettings();
    const slotEnd = slotStart + booking_duration;

    const tableBookingRows = dbGetTableBookingRows({
        ...slotRequest,
        tableGroupId,
    });
    const groupMap = createGroupMap(tableBookingRows);

    const tableMap = groupMap.get(tableGroupId)?.tableMap ?? new Map();

    for (const [tableId, bookedSlots] of tableMap) {
        if (isTableFree(bookedSlots, slotStart, slotEnd)) {
            return tableId;
        }
    }

    return null;
}

export interface BookingRequest extends Omit<
    CreateBooking,
    "table_id" | "duration_minutes" | "status"
> {
    tableGroupId: number;
}

export function completeBooking(bookingRequest: BookingRequest): Booking {
    const booking = withTransaction(() => {
        const tableId = assignTableId(
            {
                date: bookingRequest.booking_date,
                pax: bookingRequest.pax,
            },
            bookingRequest.tableGroupId,
            bookingRequest.booking_start_time,
        );

        if (!tableId) {
            throw new ConflictError(customerBookingMessages.noAvailableTable());
        }

        return createBooking({
            ...bookingRequest,
            table_id: tableId,
            status: "PENDING",
        });
    });

   sendEmail(booking).catch((error) => console.error({ error }));

    return booking;
}

export function getBookingDetails(bookingSecret: string): Booking {
    const booking = dbGetBookingByBookingSecret(bookingSecret);
    if (!booking) {
        throw new NotFoundError(
            customerBookingMessages.notFoundBySecret(bookingSecret),
        );
    }
    return booking;
}

export function confirmBooking(bookingSecret: string): Booking {
    const booking = dbGetBookingByBookingSecret(bookingSecret);
    if (!booking) {
        throw new NotFoundError(
            customerBookingMessages.notFoundBySecret(bookingSecret),
        );
    }

    const status = booking.status;
    if (status == "CANCELLED") {
        throw new ConflictError(customerBookingMessages.alreadyCancelled());
    }

    if (status != "CONFIRMED") {
        return dbUpdateBooking(booking.id, { status: "CONFIRMED" });
    }

    return booking;
}

export function cancelBooking(bookingSecret: string): Booking {
    const booking = dbGetBookingByBookingSecret(bookingSecret);
    if (!booking) {
        throw new NotFoundError(
            customerBookingMessages.notFoundBySecret(bookingSecret),
        );
    }

    const status = booking.status;
    if (status != "CANCELLED") {
        return dbUpdateBooking(booking.id, { status: "CANCELLED" });
    }

    return booking;
}
