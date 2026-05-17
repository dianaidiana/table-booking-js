import { getDb } from "../../db-setup.ts";
import type {
    Assert,
    Equal,
    EqualPropertyNames,
    PartialWithUndefined,
} from "../../utils.ts";

export interface Settings {
    booking_duration: number;
}

export type PartialSettings = PartialWithUndefined<Settings>;

export async function dbUpdateSettings({
    booking_duration,
}: PartialSettings): Promise<Settings> {
    const db = getDb();

    const obj = { booking_duration };
    type Check = Assert<EqualPropertyNames<typeof obj, PartialSettings>>;

    const setExprs = ["id = id"];
    const values = [];
    for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
            setExprs.push(`${key} = ?`);
            values.push(value);
        }
    }

    const stmt = db.prepare<unknown[], Settings>(
        `UPDATE settings SET ${setExprs.join(", ")} RETURNING booking_duration`,
    );
    const updatedSettings = stmt.get(...values);
    if (!updatedSettings) {
        throw new Error("Failed to update settings");
    }

    return updatedSettings;
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
