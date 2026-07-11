import { uuid } from "zod";
import { getTimeFromMinutes } from "../../utils.ts";
import {
    dbGetBookingByBookingSecret,
    type Booking,
    type CreateBooking,
} from "../bookings/bookings.dba.ts";
import { createBooking } from "../bookings/bookings.service.ts";
import { dbGetOpeningHoursByDay } from "../opening-hours/opening-hours.dba.ts";
import { dbGetSettings } from "../settings/settings.dba.ts";
import type { TableGroup } from "../table-groups/table-groups.dba.ts";
import { dbGetTableBookingRows, type TableBookingRow } from "./customer.dba.ts";
import { validate as uuidValidate } from "uuid";

// completeRegistration(

// 	await createBooking(..);

// 	await sendEmail();

// )

// confirmRegistration(booking_secret)

// cancelRegistration(booking_secret);

// await fetch("sendemail.com/send", { method: "POST", body: "email" });

interface BookedSlot {
    start: number;
    end: number;
}

type TableMap = Map<number, BookedSlot[]>;
type GroupMap = Map<number, { groupName: string; tableMap: TableMap }>;

export interface AvailableSlots {
    tableGroupId: number;
    tableGroupName: string;
    availableStartTimes: number[];
}

export interface BookingRequest extends Omit<
    CreateBooking,
    "table_id" | "duration_minutes" | "status"
> {}

export function getAvailableSlots(
    date: Temporal.PlainDate,
    pax: number,
): AvailableSlots[] {
    const openingHours = dbGetOpeningHoursByDay(date.dayOfWeek % 7);
    const { booking_duration } = dbGetSettings();
    if (!openingHours || openingHours.is_closed) {
        return [];
    }

    const tableBookingRows = dbGetTableBookingRows(date, pax);
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

// careful: this method assumes that all bookings belong to the same tableGroup
function createTableMap(tableBookingRows: TableBookingRow[]): TableMap {
    const tableMap: TableMap = new Map();

    for (const row of tableBookingRows) {
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

    return tableMap;
}

// if (slotStart,slotEnd) intersects any blokedSlot in the array, then it's not free
function isTableFree(
    bookedSlots: BookedSlot[],
    slotStart: number,
    slotEnd: number,
): boolean {
    for (const bookedSlot of bookedSlots) {
        if (slotStart < bookedSlot.end && slotEnd > bookedSlot.start) {
            return false;
        }
    }

    return true;
}

export function assignTableId(
    date: Temporal.PlainDate,
    pax: number,
    slotStart: number,
    tableGroupId: number,
): number | null {
    const { booking_duration } = dbGetSettings();
    const slotEnd = slotStart + booking_duration;

    const tableBookingRows = dbGetTableBookingRows(date, pax, tableGroupId);
    const tableMap = createTableMap(tableBookingRows);

    for (const [tableId, bookedSlots] of tableMap) {
        if (isTableFree(bookedSlots, slotStart, slotEnd)) {
            return tableId;
        }
    }

    return null;
}

export function completeRegistration(
    bookingRequest: BookingRequest,
    tableGroupId: number,
): Booking {
    const tableId = assignTableId(
        Temporal.PlainDate.from(bookingRequest.booking_date),
        bookingRequest.pax,
        bookingRequest.booking_start_time,
        tableGroupId,
    );

    if (!tableId) {
        throw new Error("Failed to create booking: no available table found");
    }

    const booking = createBooking({
        ...bookingRequest,
        table_id: tableId,
        status: "PENDING",
    });
    console.log(
        `Fake email:
        Hi ${booking.guest_first_name},
        Thank you for booking with us!
        Please review your reservation details and click on the buttons below to confirm or cancel your reservation:
        Date: ${booking.booking_date}
        Time: ${getTimeFromMinutes(booking.booking_start_time).toString()}
        Attendees: ${booking.pax}
        [CONFIRM] [CANCEL]
        `,
    );

    return booking;
}

export function confirmRegistration(bookingSecret: string) {
    const booking = dbGetBookingByBookingSecret(bookingSecret);
}
