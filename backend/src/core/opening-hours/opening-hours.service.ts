import { dbListBookings } from "../bookings/bookings.dba.ts";
import {
    dbGetOpeningHoursPerDay,
    dbListOpeningHours,
    dbUpdateOpeningHours,
    type OpeningHours,
    type UpdateOpeningHours,
} from "./opening-hours.dba.ts";

export async function listOpeningHours(): Promise<OpeningHours[]> {
    return await dbListOpeningHours();
}

export async function getOpeningHoursPerDay(
    weekday: number,
): Promise<OpeningHours | undefined> {
    return await dbGetOpeningHoursPerDay(weekday);
}

export async function updateOpeningHours(
    weekday: number,
    updateOpeningHours: UpdateOpeningHours,
): Promise<OpeningHours> {
    const upcomingBookingsOnWeekday = await dbListBookings({
        weekday: weekday,
    });

    if (upcomingBookingsOnWeekday.length > 0) {
        if (updateOpeningHours.opening_time) {
            const newOpeningTime = updateOpeningHours.opening_time;
            const conflictingBookingsAtOpening = upcomingBookingsOnWeekday.some(
                (b) => b.booking_start_time < newOpeningTime,
            );
            if (conflictingBookingsAtOpening) {
                throw new Error(
                    "Failed to update opening houres: conflicting bookings",
                );
            }
        }

        if (updateOpeningHours.closing_time) {
            const newClosingTime = updateOpeningHours.closing_time;
            const conflictingBookingsAtClosing = upcomingBookingsOnWeekday.some(
                (b) =>
                    b.booking_start_time + b.duration_minutes > newClosingTime,
            );
            if (conflictingBookingsAtClosing) {
                throw new Error(
                    "Failed to update opening houres: conflicting bookings",
                );
            }
        }

        if (updateOpeningHours.is_closed === true) {
            throw new Error(
                "Failed to update opening houres: conflicting bookings",
            );
        }
    }

    return await dbUpdateOpeningHours(weekday, updateOpeningHours);
}
