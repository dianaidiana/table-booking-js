import { getDb } from "../../db-setup.ts";
import { dbGetSettings } from "../settings/settings.dba.ts";
import { dbPatchHelper } from "../../db-utils.ts";
import type { PartialWithUndefined } from "../../types-utils.ts";
import type { UUIDTypes } from "uuid";
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

export interface BookingsFilters {
    specificDate?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    weekday?: number | undefined;
    startTime?: number | undefined;
    endTime?: number | undefined;
    includeCancelled?: boolean | undefined;
    tableId?: number | undefined;
    guestEmail?: string | undefined;
    exclude?: number | undefined;
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

export async function dbListBookings(
    filters: BookingsFilters,
): Promise<Booking[]> {
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

export async function dbExistsBookings(
    filters: BookingsFilters,
): Promise<boolean> {
    const db = getDb();
    const { setExpr, values } = makeSqlFilterArguments(filters);

    return (
        db
            .prepare(
                `SELECT id
                FROM bookings
                WHERE ${setExpr}
            `,
            )
            .get(...values) !== undefined
    );
}

function makeSqlFilterArguments(filters: BookingsFilters) {
    const setExprs = ["1 = 1"];
    const values = [];

    const {
        specificDate,
        startDate,
        endDate,
        weekday,
        startTime,
        endTime,
        includeCancelled,
        tableId,
        guestEmail,
        exclude,
    } = filters;

    if (specificDate) {
        setExprs.push("booking_date = ?");
        values.push(specificDate);
    }
    if (startDate) {
        setExprs.push("booking_date >= ?");
        values.push(startDate);
    }
    if (endDate) {
        setExprs.push("booking_date <= ?");
        values.push(endDate);
    }

    if (weekday !== undefined) {
        setExprs.push("strftime('%w', booking_date) = ?");
        values.push(String(weekday));
    }

    // startTime and endTime search for intersection
    //[st,et] int [bst,bet] iff et > bst && st < bet
    // bet = bst + duration
    if (startTime) {
        if (specificDate) {
            setExprs.push("(booking_start_time + duration_minutes) > ?");
            values.push(startTime);
        } else if (startDate) {
            setExprs.push(
                "(booking_date > ? OR (booking_start_time + duration_minutes) > ?)",
            );
            values.push(startDate);
            values.push(startTime);
        }
    }
    if (endTime) {
        if (specificDate) {
            setExprs.push("booking_start_time < ?");
            values.push(endTime);
        } else if (endDate) {
            setExprs.push("(booking_date < ? OR booking_start_time < ?)");
            values.push(endDate);
            values.push(endTime);
        }
    }

    if (!includeCancelled) {
        setExprs.push("status != 'CANCELLED'");
    }

    if (tableId !== undefined) {
        setExprs.push("table_id = ?");
        values.push(tableId);
    }

    if (guestEmail !== undefined) {
        setExprs.push("guest_email = ?");
        values.push(guestEmail);
    }

    if (exclude) {
        setExprs.push("id != ?");
        values.push(exclude);
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
    bookingSecret: UUIDTypes,
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
        VALUES (${values.map(() => "?").join(", ")}) 
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
