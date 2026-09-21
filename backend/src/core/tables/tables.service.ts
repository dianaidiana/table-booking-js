import { getMinutesFrom00hs } from "../../utils.ts";
import { dbExistsBookings } from "../bookings/bookings.dba.ts";
import { ConflictError, NotFoundError } from "../../errors.ts";
import { tableMessages } from "../../error-messages.ts";
import { withTransaction } from "../../db-utils.ts";
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

export function getTable(id: number): Table {
    const table = dbGetTable(id);
    if (!table) {
        throw new NotFoundError(tableMessages.notFound(id));
    }
    return table;
}

export function createTable(createTable: CreateTable): Table {
    return dbCreateTable(createTable);
}

export class TableHasBookingsUpdateError extends ConflictError {
    public id;
    constructor(id: number) {
        super(tableMessages.hasBookings(id));
        this.id = id;
    }
}

export function updateTable(id: number, updateTable: UpdateTable): Table {
    return withTransaction(() => {
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
    });
}

export function deleteTable(id: number): void {
    withTransaction(() => {
        if (
            dbExistsBookings({
                tableId: id,
                startDate: Temporal.Now.plainDateISO().toString(),
                startTime: getMinutesFrom00hs(Temporal.Now.plainTimeISO()),
            })
        ) {
            throw new TableHasBookingsUpdateError(id);
        }

        const wasDeleted = dbDeleteTable(id);
        if (!wasDeleted) {
            throw new NotFoundError(tableMessages.notFound(id));
        }
    });
}
