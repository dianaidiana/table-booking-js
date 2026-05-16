import {
    dbCreateTableGroup,
    dbDeleteTableGroup,
    dbGetTableGroup,
    dbListTableGroups,
    dbUpdateTableGroup,
    type CreateTableGroup,
    type TableGroup,
    type UpdateTableGroup,
} from "./table-groups.dba.js";

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
    return await dbUpdateTableGroup(id, { name });
}

export async function deleteTableGroup(id: number): Promise<boolean> {
    return await dbDeleteTableGroup(id);
}
