import {
    dbCreateTable,
    dbDeleteTable,
    dbGetTable,
    dbListTables,
    dbUpdateTable,
    type CreateTableDb,
    type Table,
    type UpdateTableDb,
} from "./tables.dba.js";

export async function listTables(): Promise<Table[]> {
    return await dbListTables();
}

export async function getTable(id: number): Promise<Table | undefined> {
    return await dbGetTable(id);
}

export async function createTable(createTable: CreateTableDb): Promise<Table> {
    return await dbCreateTable(createTable);
}

export async function updateTable(
    id: number,
    updateTable: UpdateTableDb,
): Promise<Table> {
    if (updateTable.disabled == 1) {
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
