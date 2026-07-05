import express from "express";
import z from "zod";
import type { CreateBooking, BookingsFilters } from "./bookings.dba.ts";
import type { Assert, Equal } from "../../types-utils.ts";
import {
    createBooking,
    getBooking,
    listBookings,
    updateBooking,
} from "./bookings.service.ts";

const filterBookingsBodySchema = z
    .object({
        specificDate: z.iso.date(),
        startDate: z.iso.date(),
        endDate: z.iso.date(),
        weekday: z.number().max(6).min(0),
        startTime: z.number().positive(),
        endTime: z.number().positive(),
        includeCancelled: z.boolean(),
        tableId: z.number().positive(),
        guestEmail: z.email(),
        exclude: z.number().positive(),
    })
    .strict()
    .partial();

type CheckFilters = Assert<
    Equal<z.infer<typeof filterBookingsBodySchema>, BookingsFilters>
>;

export function listBookingsController(
    req: express.Request,
    res: express.Response,
) {
    const filters = filterBookingsBodySchema.parse(req.query);
    const bookings = listBookings(filters);
    res.status(200).json(bookings);
}

const getBookingParamsSchema = z
    .object({
        id: z.number().positive(),
    })
    .strict();

export function getBookingController(
    req: express.Request,
    res: express.Response,
) {
    const { id } = getBookingParamsSchema.parse(req.params);

    const booking = getBooking(id);
    if (!booking) {
        res.status(404).json({ error: "not found" });
    }

    res.status(200).json(booking);
}

const createBookingBodySchema = z
    .object({
        table_id: z.number().positive(),
        booking_date: z.iso.date(),
        booking_start_time: z.number().positive(),
        pax: z.number().positive(),
        guest_first_name: z.string().nonempty(),
        guest_last_name: z.string().nonempty(),
        guest_email: z.email(),
        guest_phone: z.e164(),
        special_requests: z.string().nonempty().optional(),
        status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"]),
        duration_minutes: z.number().positive().optional(),
    })
    .strict();

type CheckCreateBooking = Assert<
    Equal<z.infer<typeof createBookingBodySchema>, CreateBooking>
>;

export function createBookingController(
    req: express.Request,
    res: express.Response,
) {
    const body = createBookingBodySchema.parse(req.body);

    const booking = createBooking(body);

    res.json(200).json(booking);
}

const updateBookingBodySchema = createBookingBodySchema.partial();
const updateBookingParamsSchema = z
    .object({
        id: z.coerce.number(),
    })
    .strict();

export function updateBookingController(
    req: express.Request,
    res: express.Response,
) {
    const body = updateBookingBodySchema.parse(req.body);
    const { id } = updateBookingParamsSchema.parse(req.params);
    const booking = updateBooking(id, body);

    res.status(200).json(booking);
}
