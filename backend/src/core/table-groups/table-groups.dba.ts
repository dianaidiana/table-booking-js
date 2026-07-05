import { getDb } from "../../db-setup.ts";
import type { PartialWithUndefined } from "../../types-utils.ts";
import { dbPatchHelper } from "../../db-utils.ts";
import db, { SqliteError } from "better-sqlite3";

export interface TableGroup {
    id: number;
    name: string;
}

export type CreateTableGroup = Omit<TableGroup, "id">;
export type UpdateTableGroup = PartialWithUndefined<CreateTableGroup>;

export function dbListTableGroups(): TableGroup[] {
    const db = getDb();
    const tableGroups = db
        .prepare<[], TableGroup>("SELECT * FROM table_groups")
        .all();

    return tableGroups;
}

export function dbGetTableGroup(id: number): TableGroup | undefined {
    const db = getDb();
    const tableGroup = db
        .prepare<
            [number],
            TableGroup
        >("SELECT * FROM table_groups WHERE id = ?")
        .get(id);

    return tableGroup;
}

export function dbCreateTableGroup({ name }: CreateTableGroup): TableGroup {
    const db = getDb();

    const tableGroup = db
        .prepare<
            [string],
            TableGroup
        >("INSERT INTO table_groups (name) VALUES (?) RETURNING *")
        .get(name);

    if (!tableGroup) {
        throw new Error("Failed to create table group");
    }

    return tableGroup;
}

export function dbUpdateTableGroup(
    id: number,
    { name }: UpdateTableGroup,
): TableGroup {
    const db = getDb();

    return dbPatchHelper<UpdateTableGroup, TableGroup>(
        db,
        id,
        { name },
        {
            primaryKey: "id",
            tableName: "table_groups",
        },
    );
}

export class TableGroupHasTablesDeleteError extends Error {
    public id;
    constructor(id: number) {
        super(`Failed to delete table group ${id}; it has associated tables`);
        this.id = id;
    }
}

export function dbDeleteTableGroup(id: number): boolean {
    const db = getDb();
    const stmt = db.prepare<[number], void>(
        "DELETE FROM table_groups WHERE id = ?",
    );
    try {
        const result = stmt.run(id);
        return result.changes > 0;
    } catch (e) {
        if (e instanceof SqliteError) {
            if (e.code == "SQLITE_CONSTRAINT_FOREIGNKEY") {
                throw new TableGroupHasTablesDeleteError(id);
            }
        }
        throw e;
    }
}
