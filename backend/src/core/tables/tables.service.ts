import {
    dbCreateTable,
    dbGetTable,
    dbListTables,
    type CreateTable,
    type Table,
} from "./tables.dba.js";

export async function listTables(): Promise<Table[]> {
    return await dbListTables();
}

export async function getTable(id: number): Promise<Table | undefined> {
    return await dbGetTable(id);
}

export async function createTable(obj: CreateTable): Promise<Table> {
    return await dbCreateTable(obj);
}
