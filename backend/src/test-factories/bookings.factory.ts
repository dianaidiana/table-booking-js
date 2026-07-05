import { randomUUID } from "crypto";
import {
    dbCreateBooking,
    type CreateBooking,
} from "../core/bookings/bookings.dba.ts";
import { tablesFactory } from "./tables.factory.ts";
import { dbGetOpeningHoursByDay } from "../core/opening-hours/opening-hours.dba.ts";

export const bookingsFactory = {
    create: (overrides: Partial<CreateBooking> = {}) => {
        let table_id = overrides.table_id;

        if (!table_id) {
            const table = tablesFactory.create();
            table_id = table.id;
        }

        let booking_date = overrides.booking_date;
        let booking_start_time = overrides.booking_start_time;

        if (!booking_date) {
            const bookingDate = Temporal.Now.plainDateISO().add({ days: 1 });
            booking_date = bookingDate.toString();
        }

        if (!booking_start_time) {
            const openingHours = dbGetOpeningHoursByDay(
                Temporal.PlainDate.from(booking_date).dayOfWeek % 7,
            );
            booking_start_time = openingHours!.opening_time;
        }

        const data: CreateBooking = {
            table_id,
            booking_date,
            booking_start_time,
            pax: 2,
            guest_first_name: "fistName",
            guest_last_name: "lastName",
            guest_email: "test@gmail.com",
            guest_phone: "+4369933334444",
            status: "CONFIRMED",
            ...overrides,
        };

        const secret = randomUUID();
        return dbCreateBooking(data, secret);
    },
};
