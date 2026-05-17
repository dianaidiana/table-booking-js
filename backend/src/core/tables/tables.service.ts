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
        // conflictingBookings = await getUpcomingBookingsForTable(table_id)
        // if (conflictingBookings) {
        //  return ?
        // }
    }
    return await dbUpdateTable(id, updateTable);
}

export async function deleteTable(id: number): Promise<boolean> {
    // conflictingBookings = await getUpcomingBookingsForTable(table_id)
    // if (conflictingBookings) {
    //  return false;
    // }
    return await dbDeleteTable(id);
}
