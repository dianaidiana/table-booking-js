import { randomUUID } from "crypto";
import {
    dbCreateBooking,
    dbGetBooking,
    dbListBookings,
    dbUpdateBooking,
    type Booking,
    type CreateBooking,
    type BookingsFilters,
    type UpdateBooking,
} from "./bookings.dba.ts";
import { dbGetTable } from "../tables/tables.dba.ts";
import { dbGetOpeningHoursByDay } from "../opening-hours/opening-hours.dba.ts";
import { dbGetSettings } from "../settings/settings.dba.ts";

export async function listBookings(
    filters: BookingsFilters,
): Promise<Booking[]> {
    return await dbListBookings(filters);
}

export async function getBooking(id: number): Promise<Booking | undefined> {
    return await dbGetBooking(id);
}

export async function createBooking(
    createBooking: CreateBooking,
): Promise<Booking> {
    const isAvailable = await isTableAvailable({
        table_id: createBooking.table_id,
        booking_date: createBooking.booking_date,
        duration_minutes:
            createBooking.duration_minutes ??
            (await dbGetSettings()).booking_duration,
        booking_start_time: createBooking.booking_start_time,
        pax: createBooking.pax,
    });

    if (!isAvailable) {
        throw new Error("Failed to create booking: table not available");
    }

    const bookingSecret = randomUUID();
    return await dbCreateBooking(createBooking, bookingSecret);
}

export async function updateBooking(
    id: number,
    updateBooking: UpdateBooking,
): Promise<Booking> {
    if (
        updateBooking.table_id ||
        updateBooking.booking_date ||
        updateBooking.booking_start_time ||
        updateBooking.duration_minutes
    ) {
        const currentBooking = await dbGetBooking(id);
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
            pax: updateBooking.pax ?? currentBooking.booking_start_time,
        };

        const isAvailable = await isTableAvailable(hardRequirements, id);

        if (!isAvailable) {
            throw new Error("Failed to update booking: table not available");
        }
    }

    return await dbUpdateBooking(id, updateBooking);
}

interface HardRequirements {
    table_id: number;
    booking_date: string;
    duration_minutes: number;
    booking_start_time: number;
    pax: number;
}

async function isTableAvailable(
    hardRequirements: HardRequirements,
    excludeBookingId?: number,
) {
    const table = await dbGetTable(hardRequirements.table_id);
    if (!table || table.disabled || table.capacity < hardRequirements.pax) {
        return false;
    }

    const bookingDate = new Date(hardRequirements.booking_date);
    const weekday = bookingDate.getDay();
    const openingHours = await dbGetOpeningHoursByDay(weekday);

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

    let existingBookings = await dbListBookings({
        specificDate: hardRequirements.booking_date,
        tableId: hardRequirements.table_id,
    });

    if (excludeBookingId) {
        existingBookings = existingBookings.filter(
            (b) => b.id !== excludeBookingId,
        );
    }

    const someHasConflict = existingBookings.some((b) => {
        const existingStart = b.booking_start_time;
        const existingEnd = b.booking_start_time + b.duration_minutes;
        return existingEnd > newStart && existingStart < newEnd;
    });

    return !someHasConflict;
}
