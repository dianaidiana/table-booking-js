import { exactOptional } from "zod";
import { getDb } from "../../db-setup.js";
import type {
    Assert,
    EqualPropertyNames,
    PartialWithUndefined,
} from "../../utils.js";

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

export async function dbUpdateTableGroup({
    name,
}: UpdateTableGroup): Promise<TableGroup> {
    const db = getDb();

    const obj = { name };
    type Check = Assert<EqualPropertyNames<typeof obj, UpdateTableGroup>>;

    const setExprs = ["id = id"];
    const values = [];
    for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
            setExprs.push(`${key} = ?`);
            values.push(value);
        }
    }

    const stmt = db.prepare<unknown[], TableGroup>(
        `UPDATE table_groups SET ${setExprs.join(", ")} RETURNING *`,
    );
    const updatedTableGroup = stmt.get(...values);
    if (!updatedTableGroup) {
        throw new Error("Failed to update table group");
    }

    return updatedTableGroup;
}

export async function dbDeleteTableGroup(id: number): Promise<boolean> {
    const db = getDb();
    const stmt = db.prepare<[number], void>(
        "DELETE FROM table_groups WHERE id = ?",
    );
    const result = stmt.run(id);
    return result.changes > 0;
}
