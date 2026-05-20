import { getDb } from "../../db-setup.ts";
import type { PartialWithUndefined, ToDb } from "../../utils.ts";
import { dbPatchHelper } from "../../db-utils.ts";

export interface Table {
    id: number;
    table_group_id: number;
    table_number: string;
    capacity: number;
    disabled: boolean;
}

type TableDb = ToDb<Table>;

export type CreateTable = Omit<Table, "id">;
type CreateTableDb = ToDb<CreateTable>;

export type UpdateTable = PartialWithUndefined<CreateTable>;

function castTableDbToTable(table: TableDb): Table {
    return {
        ...table,
        disabled: Boolean(table.disabled),
    };
}

function castCreateTableToCreateTableDb(
    createTable: CreateTable,
): CreateTableDb {
    const disabled = createTable.disabled;
    return {
        ...createTable,
        disabled: disabled === true ? 1 : 0,
    };
}

export async function dbListTables(): Promise<Table[]> {
    const db = getDb();
    const tables = db.prepare<[], TableDb>("SELECT * FROM tables").all();

    return tables.map((table) => castTableDbToTable(table));
}

export async function dbGetTable(id: number): Promise<Table | undefined> {
    const db = getDb();
    const table = db
        .prepare<[number], TableDb>("SELECT * FROM tables WHERE id = ?")
        .get(id);

    if (table) {
        return castTableDbToTable(table);
    }
}

export async function dbCreateTable(createTable: CreateTable): Promise<Table> {
    const db = getDb();

    const stmt = db.prepare<CreateTableDb, TableDb>(
        `INSERT INTO tables (table_group_id, table_number, capacity, disabled) 
         VALUES (@table_group_id, @table_number, @capacity, @disabled) 
         RETURNING *`,
    );

    const table = stmt.get(castCreateTableToCreateTableDb(createTable));

    if (!table) {
        throw new Error("Failed to create table");
    }

    return castTableDbToTable(table);
}

export async function dbUpdateTable(
    id: number,
    { table_group_id, table_number, capacity, disabled }: UpdateTable,
): Promise<Table> {
    const db = getDb();

    const out = await dbPatchHelper<UpdateTable, TableDb>(
        db,
        id,
        {
            table_group_id,
            table_number,
            capacity,
            disabled,
        },
        {
            primaryKey: "id",
            tableName: "tables",
        },
    );

    return castTableDbToTable(out);
}

export async function dbDeleteTable(id: number): Promise<boolean> {
    const db = getDb();
    const stmt = db.prepare<[number], void>("DELETE FROM tables WHERE id = ?");
    const result = stmt.run(id);
    return result.changes > 0;
}
