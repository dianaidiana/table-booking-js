import { dbExistsBookings, dbListBookings } from "../bookings/bookings.dba.ts";
import {
    dbCreateTable,
    dbDeleteTable,
    dbGetTable,
    dbListTables,
    dbUpdateTable,
    type CreateTable,
    type Table,
    type UpdateTable,
} from "./tables.dba.ts";

export async function listTables(): Promise<Table[]> {
    return await dbListTables();
}

export async function getTable(id: number): Promise<Table | undefined> {
    return await dbGetTable(id);
}

export async function createTable(createTable: CreateTable): Promise<Table> {
    return await dbCreateTable(createTable);
}

export async function updateTable(
    id: number,
    updateTable: UpdateTable,
): Promise<Table> {
    if (updateTable.disabled) {
        if (
            await dbExistsBookings({
                tableId: id,
                startDate: Temporal.Now.plainDateISO().toString(),
                //startTime
            })
        ) {
            throw new Error("Failed to update table: conflicting bookings");
        }
    }
    return await dbUpdateTable(id, updateTable);
}

export async function deleteTable(id: number): Promise<boolean> {
    if (await hasBookings(id)) {
        throw new Error("Failed to delete table: conflicting bookings");
    }
    return await dbDeleteTable(id);
}

//TODO: hasBookingsAfter(id, time, date)
async function hasBookings(id: number) {
    const conflictingBookings = await dbListBookings({
        tableId: id,
    });

    return conflictingBookings.length > 0;
}
