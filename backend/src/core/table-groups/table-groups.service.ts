import { error } from "node:console";
import { dbListTables } from "../tables/tables.dba.ts";
import {
    dbCreateTableGroup,
    dbDeleteTableGroup,
    dbGetTableGroup,
    dbListTableGroups,
    dbUpdateTableGroup,
    type CreateTableGroup,
    type TableGroup,
    type UpdateTableGroup,
} from "./table-groups.dba.ts";

export async function listTableGroups(): Promise<TableGroup[]> {
    return await dbListTableGroups();
}

export async function getTableGroup(
    id: number,
): Promise<TableGroup | undefined> {
    return await dbGetTableGroup(id);
}

export async function createTableGroup({
    name,
}: CreateTableGroup): Promise<TableGroup> {
    return await dbCreateTableGroup({ name });
}

export async function updateTableGroup(
    id: number,
    { name }: UpdateTableGroup,
): Promise<TableGroup> {
    if (await hasConflictingTables(id)) {
        throw new Error("Failed to update group table: confilcting tables");
    }
    return await dbUpdateTableGroup(id, { name });
}

export async function deleteTableGroup(id: number): Promise<boolean> {
    if (await hasConflictingTables(id)) {
        throw new Error("Failed to update group table: confilcting tables");
    }
    return await dbDeleteTableGroup(id);
}

async function hasConflictingTables(id: number) {
    const tables = await dbListTables();
    return tables.some((t) => t.table_group_id == id);
}
