import { getDb } from "../../db-setup.ts";
import type { PartialWithUndefined } from "../../types-utils.ts";
import { dbPatchHelper } from "../../db-utils.ts";

export interface TableGroup {
    id: number;
    name: string;
}

export type CreateTableGroup = Omit<TableGroup, "id">;
export type UpdateTableGroup = PartialWithUndefined<CreateTableGroup>;

export async function dbListTableGroups(): Promise<TableGroup[]> {
    const db = getDb();
    const tableGroups = db
        .prepare<[], TableGroup>("SELECT * FROM table_groups")
        .all();

    return tableGroups;
}

export async function dbGetTableGroup(
    id: number,
): Promise<TableGroup | undefined> {
    const db = getDb();
    const tableGroup = db
        .prepare<
            [number],
            TableGroup
        >("SELECT * FROM table_groups WHERE id = ?")
        .get(id);

    return tableGroup;
}

export async function dbCreateTableGroup({
    name,
}: CreateTableGroup): Promise<TableGroup> {
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

export async function dbUpdateTableGroup(
    id: number,
    { name }: UpdateTableGroup,
): Promise<TableGroup> {
    const db = getDb();

    return await dbPatchHelper<UpdateTableGroup, TableGroup>(
        db,
        id,
        { name },
        {
            primaryKey: "id",
            tableName: "table_groups",
        },
    );
}

export async function dbDeleteTableGroup(id: number): Promise<boolean> {
    const db = getDb();
    const stmt = db.prepare<[number], void>(
        "DELETE FROM table_groups WHERE id = ?",
    );
    const result = stmt.run(id);
    return result.changes > 0;
}
