import express from "express";
import { getSettings, updateSettings } from "./settings.service.js";

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
    const { booking_duration }: { booking_duration: unknown } = req.body;

    if (booking_duration !== undefined) {
        if (typeof booking_duration !== "number" || booking_duration <= 0) {
            res.status(400).json({ error: "Invalid booking duration" });
            return;
        }
    }

    res.status(200).json(await updateSettings({ booking_duration }));
}
