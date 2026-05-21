import express from "express";
import {
    getOpeningHoursPerDay,
    listOpeningHours,
    updateOpeningHours,
} from "./opening-hours.service.ts";
import z from "zod";
import type { Assert, Equal } from "../../types-utils.ts";
import type { UpdateOpeningHours } from "./opening-hours.dba.ts";

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
        opening_time: z.number().positive().max(1440),
        closing_time: z.number().positive().max(1440),
        is_closed: z.boolean(),
    })
    .strict()
    .partial();

const updateOpeningHoursParamsSchema = z
    .object({
        weekday: z.coerce.number(),
    })
    .strict();

type Check = Assert<
    Equal<z.infer<typeof updateOpeningHoursBodySchema>, UpdateOpeningHours>
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
