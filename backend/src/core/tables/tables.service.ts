import { getMinutesFrom00hs } from "../../utils.ts";
import { dbExistsBookings } from "../bookings/bookings.dba.ts";
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

export function listTables(): Table[] {
    return dbListTables();
}

export function getTable(id: number): Table | undefined {
    return dbGetTable(id);
}

export function createTable(createTable: CreateTable): Table {
    return dbCreateTable(createTable);
}

export class TableHasBookingsUpdateError extends Error {
    public id;
    constructor(id: number) {
        super(`Failed to update table ${id}; it has associated bookings`);
        this.id = id;
    }
}

export function updateTable(id: number, updateTable: UpdateTable): Table {
    if (updateTable.disabled) {
        if (
            dbExistsBookings({
                tableId: id,
                startDate: Temporal.Now.plainDateISO().toString(),
                startTime: getMinutesFrom00hs(Temporal.Now.plainTimeISO()),
            })
        ) {
            throw new TableHasBookingsUpdateError(id);
        }
    }
    return dbUpdateTable(id, updateTable);
}

export function deleteTable(id: number): Boolean {
    if (
        dbExistsBookings({
            tableId: id,
            startDate: Temporal.Now.plainDateISO().toString(),
            startTime: getMinutesFrom00hs(Temporal.Now.plainTimeISO()),
        })
    ) {
        throw new TableHasBookingsUpdateError(id);
    }

    return dbDeleteTable(id);
}
