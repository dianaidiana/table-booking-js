import { group } from "node:console";
import { getDb } from "../../db-setup.ts";
import { dbGetOpeningHoursByDay } from "../opening-hours/opening-hours.dba.ts";
import { dbGetSettings } from "../settings/settings.dba.ts";

export interface TableBookingRow {
    table_id: number;
    table_group_id: number;
    table_group_name: string;
    start_time: number | null;
    end_time: number | null;
}

export function dbGetTableBookingRows(
    date: Temporal.PlainDate,
    pax: number,
    tableGroupId?: number,
): TableBookingRow[] {
    const db = getDb();

    let query = `SELECT
                tables.id as table_id,
                table_groups.id as table_group_id,
                table_groups.name as table_group_name,
                bookings.booking_start_time as start_time,
                bookings.booking_start_time + bookings.duration_minutes as end_time
            FROM tables
            JOIN table_groups
                ON tables.table_group_id = table_groups.id
            LEFT JOIN bookings
                ON tables.id = bookings.table_id
                AND bookings.booking_date = ?
                AND bookings.status != 'CANCELED'
            WHERE tables.capacity >= ?
                AND tables.disabled = 0
                AND tables.deleted_at IS NULL`;

    if (tableGroupId) {
        query += ` AND table_groups.id = ?`;
    }

    const tableBookingRows = db
        .prepare<[string, number, number?], TableBookingRow>(query)
        .all(date.toString(), pax, tableGroupId);

    return tableBookingRows;
}
