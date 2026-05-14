import { getDb } from "../../db-setup.js";

export interface Table {
    id: number;
    table_group_id: number;
    table_number: string;
    capacity: number;
    disabled: boolean;
}

export type CreateTable = Omit<Table, "id">;

export async function dbListTables(): Promise<Table[]> {
    const db = getDb();
    const tables = db.prepare<[], Table>("SELECT * FROM tables").all();

    return tables;
}

export async function dbGetTable(id: number): Promise<Table | undefined> {
    const db = getDb();
    const table = db
        .prepare<[number], Table>("SELECT * FROM tables WHERE id = ?")
        .get(id);

    return table;
}

export async function dbCreateTable(obj: CreateTable): Promise<Table> {
    const db = getDb();

    // TODO: should I create a type for the new object type?
    const stmt = db.prepare<any, Table>(
        `INSERT INTO tables (table_group_id, table_number, capacity, disabled) 
         VALUES (@table_group_id, @table_number, @capacity, @disabled) 
         RETURNING *`,
    );

    const table = stmt.get({
        ...obj,
        disabled: obj.disabled ? 1 : 0,
    });

    if (!table) {
        throw new Error("Failed to create table");
    }

    return {
        ...table,
        disabled: Boolean(table.disabled),
    };
}
