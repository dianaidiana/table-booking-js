import { getDb } from "../../db-setup.ts";

export interface TableBookingRow {
    table_id: number;
    table_group_id: number;
    table_group_name: string;
    start_time: number | null;
    end_time: number | null;
}

export interface TableBookingRowsFilters {
    date: string;
    pax: number;
    tableGroupId?: number;
}

export function dbGetTableBookingRows(
    tableBookingRowsFilters: TableBookingRowsFilters,
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
                AND bookings.status != 'CANCELLED'
            WHERE tables.capacity >= ?
                AND tables.disabled = 0
                AND tables.deleted_at IS NULL`;

    const values = [tableBookingRowsFilters.date, tableBookingRowsFilters.pax];

    if (tableBookingRowsFilters.tableGroupId) {
        query += ` AND table_groups.id = ?`;
        values.push(tableBookingRowsFilters.tableGroupId);
    }

    const tableBookingRows = db
        .prepare<unknown[], TableBookingRow>(query)
        .all(...values);

    return tableBookingRows;
}
