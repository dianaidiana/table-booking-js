import { getDb } from "../../db-setup.js";
import type { PartialWithUndefined, ToDb } from "../../utils.js";

export interface OpeningHours {
    weekday: number;
    opening_time: string;
    closing_time: string;
    is_closed: boolean;
}

type OpeningHoursDb = ToDb<OpeningHours>;
export type UpdateOpeningHoursDb = PartialWithUndefined<
    Omit<OpeningHoursDb, "weekday">
>;

function castToOpeningHours(openingHours: OpeningHoursDb): OpeningHours {
    return {
        ...openingHours,
        is_closed: Boolean(openingHours.is_closed),
    };
}

export async function dbListOpeningHours(): Promise<OpeningHours[]> {
    const db = getDb();
    const openingHours = db
        .prepare<[], OpeningHoursDb>("SELECT * FROM opening_hours")
        .all();

    return openingHours.map((oh) => castToOpeningHours(oh));
}

export async function dbGetOpeningHoursPerDay(
    weekday: number,
): Promise<OpeningHours | undefined> {
    const db = getDb();
    const openingHours = db
        .prepare<
            [number],
            OpeningHoursDb
        >("SELECT * FROM opening_hours WHERE weekday = ?")
        .get(weekday);

    if (openingHours) {
        return castToOpeningHours(openingHours);
    }
}

export async function dbUpdateOpeningHours(
    weekday: number,
    updateOpeningHours: UpdateOpeningHoursDb,
): Promise<OpeningHours> {
    const db = getDb();

    const setExprs = ["weekday = weekday"];
    const values = [];
    for (const [key, value] of Object.entries(updateOpeningHours)) {
        if (value !== undefined) {
            setExprs.push(`${key} = ?`);
            values.push(value);
        }
    }

    const stmt = db.prepare<unknown[], OpeningHoursDb>(
        `UPDATE opening_hours SET ${setExprs.join(", ")} WHERE weekday = ? RETURNING *`,
    );
    const openingHours = stmt.get(...values, weekday);
    if (!openingHours) {
        throw new Error("Failed to update opening hours");
    }

    return castToOpeningHours(openingHours);
}
