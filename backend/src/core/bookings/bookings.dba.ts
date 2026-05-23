import { getDb } from "../../db-setup.ts";
import { dbGetSettings } from "../settings/settings.dba.ts";
import { dbPatchHelper } from "../../db-utils.ts";
import type { PartialWithUndefined } from "../../types-utils.ts";
import type { UUID } from "crypto";
import { getMinutesFrom00hs } from "../../utils.ts";

export interface Booking {
    id: number;
    table_id: number;
    booking_date: string;
    booking_start_time: number;
    pax: number;
    guest_first_name: string;
    guest_last_name: string;
    guest_email: string;
    guest_phone: string;
    special_requests?: string;
    status: "PENDING" | "CONFIRMED" | "CANCELLED";
    booking_secret: string;
    created_at: string;
    duration_minutes: number;
}

export interface Filters {
    specificDate?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    weekday?: number | undefined;
    specificTime?: number | undefined;
    startTime?: number | undefined;
    endTime?: number | undefined;
    includeCancelled?: boolean | undefined;
    specificTableId?: number | undefined;
    specificGuestEmail?: string | undefined;
}

export interface CreateBooking extends Omit<
    Booking,
    | "id"
    | "special_requests"
    | "created_at"
    | "booking_secret"
    | "duration_minutes"
> {
    duration_minutes?: number | undefined;
    special_requests?: string | undefined;
}

export type UpdateBooking = PartialWithUndefined<CreateBooking>;

export async function dbListBookings(filters: Filters): Promise<Booking[]> {
    const db = getDb();
    const { setExpr, values } = makeSqlFilterArguments(filters);

    return db
        .prepare<unknown[], Booking>(
            `SELECT *
        FROM bookings
        WHERE ${setExpr}`,
        )
        .all(...values);
}

function makeSqlFilterArguments(filters: Filters) {
    const setExprs = ["1 = 1"];
    const values = [];

    const {
        specificDate,
        startDate,
        endDate,
        weekday,
        specificTime,
        startTime,
        endTime,
        includeCancelled,
        specificTableId,
        specificGuestEmail,
    } = filters;

    if (specificDate) {
        setExprs.push("booking_date = ?");
        values.push(specificDate);
    } else if (startDate && endDate) {
        setExprs.push("booking_date BETWEEN ? AND ?");
        values.push(startDate);
        values.push(endDate);
    } else {
        setExprs.push("booking_date >= date('now')");
    }

    if (weekday) {
        setExprs.push("strftime('%w', booking_date) = ?");
        values.push(weekday);
    }

    if (specificTime) {
        setExprs.push("booking_start_time = ?");
        values.push(specificTime);
    } else if (startTime && endTime) {
        setExprs.push("booking_start_time BETWEEN ? AND ?");
        values.push(startTime);
        values.push(endTime);
    } else {
        setExprs.push("booking_start_time >= ?");
        values.push(getMinutesFrom00hs(new Date()));
    }

    if (!includeCancelled) {
        setExprs.push("status != 'CANCELLED'");
    }

    if (specificTableId) {
        setExprs.push("table_id = ?");
        values.push(specificTableId);
    }

    if (specificGuestEmail) {
        setExprs.push("guest_email = ?");
        values.push(specificGuestEmail);
    }

    return { setExpr: setExprs.join(" AND "), values };
}

export async function dbGetBooking(id: number): Promise<Booking | undefined> {
    const db = getDb();
    const booking = db
        .prepare<[number], Booking>("SELECT * FROM bookings WHERE id = ?")
        .get(id);

    return booking;
}

export async function dbCreateBooking(
    createBooking: CreateBooking,
    bookingSecret: UUID,
): Promise<Booking> {
    const db = getDb();

    if (!createBooking.duration_minutes) {
        const settings = await dbGetSettings();
        createBooking.duration_minutes = settings.booking_duration;
    }

    const setExprs = [];
    const values = [];
    for (const [key, value] of Object.entries(createBooking)) {
        if (value !== undefined) {
            setExprs.push(key);
            values.push(value);
        }
    }

    setExprs.push("booking_secret");
    values.push(bookingSecret);

    const stmt = db.prepare<unknown[], Booking>(
        `INSERT INTO bookings (${setExprs.join(", ")}) 
        VALUES (${values.join(", ")}) 
        RETURNING *`,
    );

    const booking = stmt.get(...values);

    if (!booking) {
        throw new Error("Failed to create booking");
    }

    return booking;
}

export async function dbUpdateBooking(
    id: number,
    {
        table_id,
        booking_date,
        booking_start_time,
        pax,
        guest_first_name,
        guest_last_name,
        guest_email,
        guest_phone,
        special_requests,
        status,
        duration_minutes,
    }: UpdateBooking,
): Promise<Booking> {
    const db = getDb();

    return await dbPatchHelper<UpdateBooking, Booking>(
        db,
        id,
        {
            table_id,
            booking_date,
            booking_start_time,
            pax,
            guest_first_name,
            guest_last_name,
            guest_email,
            guest_phone,
            special_requests,
            status,
            duration_minutes,
        },
        {
            primaryKey: "id",
            tableName: "bookings",
        },
    );
}
