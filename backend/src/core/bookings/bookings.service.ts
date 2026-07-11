import { v4 as uuidv4 } from "uuid";
import {
    dbCreateBooking,
    dbGetBookingById,
    dbListBookings,
    dbUpdateBooking,
    type Booking,
    type CreateBooking,
    type BookingsFilters,
    type UpdateBooking,
    dbExistsBookings,
} from "./bookings.dba.ts";
import { dbGetTable } from "../tables/tables.dba.ts";
import { dbGetOpeningHoursByDay } from "../opening-hours/opening-hours.dba.ts";
import { dbGetSettings } from "../settings/settings.dba.ts";

export function listBookings(filters: BookingsFilters): Booking[] {
    return dbListBookings(filters);
}

export function getBooking(id: number): Booking | undefined {
    return dbGetBookingById(id);
}

export function createBooking(createBooking: CreateBooking): Booking {
    const canBook = canBookTable({
        table_id: createBooking.table_id,
        booking_date: createBooking.booking_date,
        duration_minutes:
            createBooking.duration_minutes ?? dbGetSettings().booking_duration,
        booking_start_time: createBooking.booking_start_time,
        pax: createBooking.pax,
    });

    if (!canBook) {
        throw new Error("Failed to create booking: table not available");
    }

    const bookingSecret = uuidv4().toString();
    return dbCreateBooking(createBooking, bookingSecret);
}

export function updateBooking(
    id: number,
    updateBooking: UpdateBooking,
): Booking {
    if (
        updateBooking.table_id ||
        updateBooking.booking_date ||
        updateBooking.booking_start_time ||
        updateBooking.duration_minutes
    ) {
        const currentBooking = dbGetBookingById(id);
        if (!currentBooking) {
            throw new Error("Failed to update booking");
        }

        const hardRequirements = {
            table_id: updateBooking.table_id ?? currentBooking.table_id,
            booking_date:
                updateBooking.booking_date ?? currentBooking.booking_date,
            duration_minutes:
                updateBooking.duration_minutes ??
                currentBooking.duration_minutes,
            booking_start_time:
                updateBooking.booking_start_time ??
                currentBooking.booking_start_time,
            pax: updateBooking.pax ?? currentBooking.pax,
        };

        const canBook = canBookTable(hardRequirements, id);

        if (!canBook) {
            throw new Error("Failed to update booking: table not available");
        }
    }

    return dbUpdateBooking(id, updateBooking);
}

interface HardRequirements {
    table_id: number;
    booking_date: string;
    duration_minutes: number;
    booking_start_time: number;
    pax: number;
}

function canBookTable(
    hardRequirements: HardRequirements,
    excludeBookingId?: number,
) {
    const table = dbGetTable(hardRequirements.table_id);
    if (
        !table ||
        table.disabled ||
        table.capacity < hardRequirements.pax ||
        table.deleted_at != null
    ) {
        return false;
    }

    const bookingDate = Temporal.PlainDate.from(hardRequirements.booking_date);
    const weekday = bookingDate.dayOfWeek % 7;
    const openingHours = dbGetOpeningHoursByDay(weekday);

    if (!openingHours || openingHours.is_closed) {
        return false;
    }

    const duration = hardRequirements.duration_minutes;
    const newStart = hardRequirements.booking_start_time;
    const newEnd = newStart + duration;
    if (
        openingHours.opening_time > newStart ||
        openingHours.closing_time < newEnd
    ) {
        return false;
    }

    return !dbExistsBookings({
        specificDate: hardRequirements.booking_date,
        tableId: hardRequirements.table_id,
        startTime: newStart,
        endTime: newEnd,
        exclude: excludeBookingId,
    });
}
