import express from "express";
import { getDb } from "../../db-setup.js";

export const settingsRoutes = express.Router();

settingsRoutes.get("/", (req, res) => {
    const db = getDb();
    const settings = db.prepare("SELECT booking_duration FROM settings").get();
    if (!settings) {
        res.status(404).send("Settings not found");
        return;
    }

    res.status(200).json(settings);
});

settingsRoutes.patch("/", (req, res) => {
    const { booking_duration }: { booking_duration: number } = req.body;

    const db = getDb();

    if (booking_duration) {
        if (booking_duration <= 0 || typeof booking_duration !== "number") {
            res.status(400).json({ error: "Invalid booking duration" });
            return;
        }

        const stmt = db.prepare(
            "UPDATE settings SET booking_duration = ? RETURNING booking_duration",
        );
        const updated_settings = stmt.get(booking_duration);
        if (updated_settings) {
            res.status(200).json(updated_settings);
            return;
        }
    }

    res.status(500).json({ error: "Internal server error" });
});
