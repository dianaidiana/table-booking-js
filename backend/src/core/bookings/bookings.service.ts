import { randomUUID } from "crypto";
import {
    dbCreateBooking,
    dbDeleteBooking,
    dbGetBooking,
    dbListBookings,
    dbUpdateBooking,
    type Booking,
    type CreateBooking,
    type Filters,
    type UpdateBooking,
} from "./bookings.dba.ts";

export async function listBookings(filters: Filters): Promise<Booking[]> {
    return await dbListBookings(filters);
}

export async function getBooking(id: number): Promise<Booking | undefined> {
    return await dbGetBooking(id);
}

export async function createBooking(
    createBooking: CreateBooking,
): Promise<Booking> {
    const bookingSecret = randomUUID();
    return await dbCreateBooking(createBooking, bookingSecret);
}

export async function updateBooking(
    id: number,
    updateBooking: UpdateBooking,
): Promise<Booking> {
    return await dbUpdateBooking(id, updateBooking);
}

export async function deleteBooking(id: number): Promise<boolean> {
    return await dbDeleteBooking(id);
}
