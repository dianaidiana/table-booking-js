import { getDb } from "../../db-setup.ts";
import { dbPatchHelper } from "../../db-utils.ts";
import type { PartialWithUndefined } from "../../types-utils.ts";

export interface Settings {
    booking_duration: number;
}

export type PartialSettings = PartialWithUndefined<Settings>;

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

export async function dbUpdateSettings({
    booking_duration,
}: PartialSettings): Promise<Settings> {
    const db = getDb();

    return await dbPatchHelper<PartialSettings, Settings>(
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
