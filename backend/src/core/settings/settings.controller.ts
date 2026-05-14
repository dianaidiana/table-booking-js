import express from "express";
import { getSettings, updateSettings } from "./settings.service.js";
import z from "zod";
import type { PartialSettings } from "./settings.dba.js";
import type { Assert, Equal } from "../../utils.js";

const updateSettingsBodySchema = z
    .object({
        booking_duration: z.number().positive().optional(),
    })
    .strict();

type Check = Assert<
    Equal<z.infer<typeof updateSettingsBodySchema>, PartialSettings>
>;

export async function getSettingsController(
    req: express.Request,
    res: express.Response,
) {
    const settings = await getSettings();
    res.status(200).json(settings);
}

export async function updateSettingsController(
    req: express.Request,
    res: express.Response,
) {
    const partialSettings = updateSettingsBodySchema.parse(req.body);

    res.status(200).json(await updateSettings(partialSettings));
}
