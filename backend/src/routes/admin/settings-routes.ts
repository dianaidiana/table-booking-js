import express from "express";
import { getDb } from "../../db-setup.js";
import {
    dbUpdateSettings,
    type PartialSettings,
    type Settings,
} from "../../dba/settings.js";

export const settingsRoutes = express.Router();

// routes
// controller
// service
// repository or data access layer

settingsRoutes.get("/", (req, res) => {
    const db = getDb();
    const settings = db.prepare("SELECT booking_duration FROM settings").get();
    if (!settings) {
        res.status(503).json({ error: "Settings not found" });
        return;
    }

    res.status(200).json(settings);
});

settingsRoutes.patch("/", updateSettingsController);

updateSettings({ booking_duration: 120 });

async function updateSettingsController(
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

async function updateSettings({
    booking_duration,
}: PartialSettings): Promise<Settings> {
    return await dbUpdateSettings({ booking_duration });
}
