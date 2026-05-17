import { getDb } from "../../db-setup.ts";
import type { PartialWithUndefined, ToDb } from "../../utils.ts";

export interface Table {
    id: number;
    table_group_id: number;
    table_number: string;
    capacity: number;
    disabled: boolean;
}

type TableDb = ToDb<Table>;
export type CreateTableDb = Omit<TableDb, "id">;
export type UpdateTableDb = PartialWithUndefined<CreateTableDb>;

function castToTable(table: TableDb): Table {
    return {
        ...table,
        disabled: Boolean(table.disabled),
    };
}

export async function dbListTables(): Promise<Table[]> {
    const db = getDb();
    const tables = db.prepare<[], TableDb>("SELECT * FROM tables").all();

    return tables.map((table) => castToTable(table));
}

export async function dbGetTable(id: number): Promise<Table | undefined> {
    const db = getDb();
    const table = db
        .prepare<[number], TableDb>("SELECT * FROM tables WHERE id = ?")
        .get(id);

    if (table) {
        return castToTable(table);
    }
}

export async function dbCreateTable(
    createTable: CreateTableDb,
): Promise<Table> {
    const db = getDb();

    const stmt = db.prepare<CreateTableDb, TableDb>(
        `INSERT INTO tables (table_group_id, table_number, capacity, disabled) 
         VALUES (@table_group_id, @table_number, @capacity, @disabled) 
         RETURNING *`,
    );

    const table = stmt.get(createTable);

    if (!table) {
        throw new Error("Failed to create table");
    }

    return castToTable(table);
}

export async function dbUpdateTable(
    id: number,
    updateTable: UpdateTableDb,
): Promise<Table> {
    const db = getDb();

    const setExprs = ["id = id"];
    const values = [];
    for (const [key, value] of Object.entries(updateTable)) {
        if (value !== undefined) {
            setExprs.push(`${key} = ?`);
            values.push(value);
        }
    }

    const stmt = db.prepare<unknown[], TableDb>(
        `UPDATE tables SET ${setExprs.join(", ")} WHERE id = ? RETURNING *`,
    );
    const table = stmt.get(...values, id);
    if (!table) {
        throw new Error("Failed to update table");
    }

    return castToTable(table);
}

export async function dbDeleteTable(id: number): Promise<boolean> {
    const db = getDb();
    const stmt = db.prepare<[number], void>("DELETE FROM tables WHERE id = ?");
    const result = stmt.run(id);
    return result.changes > 0;
}
