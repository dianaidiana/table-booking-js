import { randomUUID } from "crypto";
import {
    dbCreateBooking,
    type CreateBooking,
} from "../core/bookings/bookings.dba.ts";

export const bookingFactory = {
    create: async (obj: CreateBooking) => {
        const bookingSecret = randomUUID();
        return dbCreateBooking(obj, bookingSecret);
    },
    // createDefault: async () => {
    //     const bookingSecret = randomUUID();
    //     return dbCreateBooking({

    //     }, bookingSecret);
    // },
};
