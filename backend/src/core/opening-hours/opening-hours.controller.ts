import express from "express";
import {
    getOpeningHoursPerDay,
    listOpeningHours,
    updateOpeningHours,
} from "./opening-hours.service.js";
import z from "zod";
import type { Assert, Equal } from "../../utils.js";
import type { UpdateOpeningHoursDb } from "./opening-hours.dba.js";

export async function listOpeningHoursController(
    req: express.Request,
    res: express.Response,
) {
    const openingHours = await listOpeningHours();
    res.status(200).json(openingHours);
}

const getOpeningHoursParamsSchema = z
    .object({
        weekday: z.coerce.number().min(0).max(6),
    })
    .strict();

export async function getOpeningHoursPerDayController(
    req: express.Request,
    res: express.Response,
) {
    const { weekday } = getOpeningHoursParamsSchema.parse(req.params);

    const openingHours = await getOpeningHoursPerDay(weekday);
    if (!openingHours) {
        res.status(404).json({ error: "not found" });
    }

    res.status(200).json(openingHours);
}

const updateOpeningHoursBodySchema = z
    .object({
        opening_time: z.iso.time(),
        closing_time: z.iso.time(),
        is_closed: z.boolean().transform((val) => Number(val)),
    })
    .strict()
    .partial();

const updateOpeningHoursParamsSchema = z
    .object({
        weekday: z.coerce.number(),
    })
    .strict();

type Check = Assert<
    Equal<z.infer<typeof updateOpeningHoursBodySchema>, UpdateOpeningHoursDb>
>;

export async function updateOpeningHoursController(
    req: express.Request,
    res: express.Response,
) {
    const body = updateOpeningHoursBodySchema.parse(req.body);
    const { weekday } = updateOpeningHoursParamsSchema.parse(req.params);
    const openingHours = await updateOpeningHours(weekday, body);

    res.status(200).json(openingHours);
}
