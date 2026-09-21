import { dbListBookings } from "../bookings/bookings.dba.ts";
import { ConflictError, NotFoundError } from "../../errors.ts";
import { openingHoursMessages } from "../../error-messages.ts";
import { withTransaction } from "../../db-utils.ts";
import {
    dbGetOpeningHoursByDay,
    dbListOpeningHours,
    dbUpdateOpeningHours,
    type OpeningHours,
    type UpdateOpeningHours,
} from "./opening-hours.dba.ts";

export function listOpeningHours(): OpeningHours[] {
    return dbListOpeningHours();
}

export function getOpeningHoursByDay(weekday: number): OpeningHours {
    const openingHours = dbGetOpeningHoursByDay(weekday);
    if (!openingHours) {
        throw new NotFoundError(openingHoursMessages.notFound(weekday));
    }
    return openingHours;
}

export function updateOpeningHours(
    weekday: number,
    updateOpeningHours: UpdateOpeningHours,
): OpeningHours {
    return withTransaction(() => {
        const upcomingBookingsOnWeekday = dbListBookings({
            weekday: weekday,
        });

        if (upcomingBookingsOnWeekday.length > 0) {
            if (updateOpeningHours.opening_time) {
                const newOpeningTime = updateOpeningHours.opening_time;
                const conflictingBookingsAtOpening =
                    upcomingBookingsOnWeekday.some(
                        (b) => b.booking_start_time < newOpeningTime,
                    );
                if (conflictingBookingsAtOpening) {
                    throw new ConflictError(
                        openingHoursMessages.conflictingBookings(),
                    );
                }
            }

            if (updateOpeningHours.closing_time) {
                const newClosingTime = updateOpeningHours.closing_time;
                const conflictingBookingsAtClosing =
                    upcomingBookingsOnWeekday.some(
                        (b) =>
                            b.booking_start_time + b.duration_minutes >
                            newClosingTime,
                    );
                if (conflictingBookingsAtClosing) {
                    throw new ConflictError(
                        openingHoursMessages.conflictingBookings(),
                    );
                }
            }

            if (updateOpeningHours.is_closed === true) {
                throw new ConflictError(
                    openingHoursMessages.conflictingBookings(),
                );
            }
        }

        return dbUpdateOpeningHours(weekday, updateOpeningHours);
    });
}
