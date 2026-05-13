import { getDb } from "../db-setup.js";
import type { PartialWithUndefined } from "../utils.js";

export interface Settings {
    booking_duration: number;
}

export type PartialSettings = PartialWithUndefined<Settings>;

export async function dbUpdateSettings({
    booking_duration,
}: PartialSettings): Promise<Settings> {
    const db = getDb();

    if (booking_duration) {
        const stmt = db.prepare<[number], Settings>(
            "UPDATE settings SET booking_duration = ? RETURNING booking_duration",
        );
        const updatedSettings = stmt.get(booking_duration);
        if (!updatedSettings) {
            throw new Error("Failed to update settings");
        }

        return updatedSettings;
    }

    return await dbGetSettings();
}

export async function dbGetSettings(): Promise<Settings> {
    const db = getDb();
    const settings = db
        .prepare<[], Settings>("SELECT booking_duration FROM settings")
        .get();
    if (!settings) {
        throw new Error("Settings not found");
    }

    return settings;
}
