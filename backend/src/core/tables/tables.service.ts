import { dbListBookings } from "../bookings/bookings.dba.ts";
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
        if (await hasConflictingBookings(id)) {
            throw new Error("Failed to update table: conflicting bookings");
        }
    }
    return await dbUpdateTable(id, updateTable);
}

export async function deleteTable(id: number): Promise<boolean> {
    if (await hasConflictingBookings(id)) {
        throw new Error("Failed to delete table: conflicting bookings");
    }
    return await dbDeleteTable(id);
}

async function hasConflictingBookings(id: number) {
    const conflictingBookings = await dbListBookings({
        specificTableId: id,
    });

    return conflictingBookings.length > 0;
}
