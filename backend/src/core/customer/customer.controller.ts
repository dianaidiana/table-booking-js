import express from "express";
import z from "zod";
import type { Assert, Equal } from "../../types-utils.ts";
import {
    type SlotRequest,
    getAvailableSlots,
    type BookingRequest,
    completeBooking,
} from "./customer.service.ts";

const getAvailableSlotsBodySchema = z
    .object({
        date: z.iso.date(),
        pax: z.number().positive(),
    })
    .strict();

type CheckFilters = Assert<
    Equal<z.infer<typeof getAvailableSlotsBodySchema>, SlotRequest>
>;

export function getAvailableSlotsController(
    req: express.Request,
    res: express.Response,
) {
    const body = getAvailableSlotsBodySchema.parse(req.body);
    const availableSlots = getAvailableSlots(body);
    res.status(200).json(availableSlots);
}

const completeBookingBodyShema = z
    .object({
        booking_date: z.iso.date(),
        booking_start_time: z.number().positive(),
        pax: z.number().positive(),
        guest_first_name: z.string().nonempty(),
        guest_last_name: z.string().nonempty(),
        guest_email: z.email(),
        guest_phone: z.e164(),
        special_requests: z.string().nonempty().optional(),
        tableGroupId: z.number().positive(),
    })
    .strict();

type CheckBookingRequest = Assert<
    Equal<z.infer<typeof completeBookingBodyShema>, BookingRequest>
>;

export function completeBookingController(
    req: express.Request,
    res: express.Response,
) {
    const body = completeBookingBodyShema.parse(req.body);
    const booking = completeBooking(body);
    res.status(200).json(booking);
}
