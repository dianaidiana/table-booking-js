import type Database from "better-sqlite3";
import { getDb } from "../../db-setup.ts";
import type {
    Assert,
    EqualPropertyNames,
    PartialWithUndefined,
    ToDb,
} from "../../utils.ts";
import { dbPatchHelper } from "../../db-utils.ts";

export interface OpeningHours {
    weekday: number;
    opening_time: string;
    closing_time: string;
    is_closed: boolean;
}

type OpeningHoursDb = ToDb<OpeningHours>;
export type UpdateOpeningHours = PartialWithUndefined<
    Omit<OpeningHours, "weekday">
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
    { opening_time, closing_time, is_closed }: UpdateOpeningHours,
): Promise<OpeningHours> {
    const db = getDb();

    const out = await dbPatchHelper<UpdateOpeningHours, OpeningHoursDb>(
        db,
        weekday,
        {
            opening_time,
            closing_time,
            is_closed,
        },
        {
            primaryKey: "weekday",
            tableName: "opening_hours",
        },
    );

    return castToOpeningHours(out);
}
