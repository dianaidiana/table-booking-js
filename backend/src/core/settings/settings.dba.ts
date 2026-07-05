import { getDb } from "../../db-setup.ts";
import { dbPatchHelper } from "../../db-utils.ts";
import type { PartialWithUndefined } from "../../types-utils.ts";

export interface Settings {
    booking_duration: number;
}

export type PartialSettings = PartialWithUndefined<Settings>;

export function dbGetSettings(): Settings {
    const db = getDb();
    const settings = db
        .prepare<[], Settings>("SELECT booking_duration FROM settings")
        .get();
    if (!settings) {
        throw new Error("Settings not found");
    }

    return settings;
}

export function dbUpdateSettings({
    booking_duration,
}: PartialSettings): Settings {
    const db = getDb();

    return dbPatchHelper<PartialSettings, Settings>(
        db,
        1,
        { booking_duration },
        {
            primaryKey: "id",
            tableName: "settings",
            outColumns: ["booking_duration"],
        },
    );
}
