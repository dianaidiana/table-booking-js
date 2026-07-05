import { getDb } from "../../db-setup.ts";
import type { PartialWithUndefined, ToDb } from "../../types-utils.ts";
import { dbPatchHelper } from "../../db-utils.ts";

export interface Table {
    id: number;
    table_group_id: number;
    name: string;
    capacity: number;
    disabled: boolean;
    deleted_at: string;
}

type TableDb = ToDb<Table>;

export type CreateTable = Omit<Table, "id" | "deleted_at">;
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

export function dbListTables(): Table[] {
    const db = getDb();
    const tables = db
        .prepare<[], TableDb>("SELECT * FROM tables WHERE deleted_at IS NULL")
        .all();

    return tables.map((table) => castTableDbToTable(table));
}

export function dbGetTable(id: number): Table | undefined {
    const db = getDb();

    const table = db
        .prepare<
            [number],
            TableDb
        >("SELECT * FROM tables WHERE id = ? AND deleted_at IS NULL")
        .get(id);

    if (table) {
        return castTableDbToTable(table);
    }
}

export function dbCreateTable(createTable: CreateTable): Table {
    const db = getDb();

    const stmt = db.prepare<CreateTableDb, TableDb>(
        `INSERT INTO tables (table_group_id, name, capacity, disabled) 
         VALUES (@table_group_id, @name, @capacity, @disabled) 
         RETURNING *`,
    );

    const table = stmt.get(castCreateTableToCreateTableDb(createTable));

    if (!table) {
        throw new Error("Failed to create table");
    }

    return castTableDbToTable(table);
}

export function dbUpdateTable(
    id: number,
    { table_group_id, name, capacity, disabled }: UpdateTable,
): Table {
    const db = getDb();

    const out = dbPatchHelper<UpdateTable, TableDb>(
        db,
        id,
        {
            table_group_id,
            name,
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

export function dbDeleteTable(id: number): Boolean {
    const db = getDb();
    const stmt = db.prepare<[number], Table>(
        "UPDATE tables SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?",
    );
    const result = stmt.run(id);
    return result.changes > 0;
    // TODO: should I return the deleted table or should I keep the true/false logic?
}
