import { getMinutesFrom00hs } from "../../utils.ts";
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

export class TableHasBookingsUpdateError extends Error {
    public id;
    constructor(id: number) {
        super(`Failed to update table ${id}; it has associated bookings`);
        this.id = id;
    }
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
                startTime: getMinutesFrom00hs(Temporal.Now.plainTimeISO()),
            })
        ) {
            throw new TableHasBookingsUpdateError(id);
        }
    }
    return await dbUpdateTable(id, updateTable);
}

export async function deleteTable(id: number): Promise<Boolean> {
    if (
        await dbExistsBookings({
            tableId: id,
            startDate: Temporal.Now.plainDateISO().toString(),
            startTime: getMinutesFrom00hs(Temporal.Now.plainTimeISO()),
        })
    ) {
        throw new TableHasBookingsUpdateError(id);
    }

    return await dbDeleteTable(id);
}
