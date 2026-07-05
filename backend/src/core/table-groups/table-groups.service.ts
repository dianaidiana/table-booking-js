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

export function listTableGroups(): TableGroup[] {
    return dbListTableGroups();
}

export function getTableGroup(id: number): TableGroup | undefined {
    return dbGetTableGroup(id);
}

export function createTableGroup({ name }: CreateTableGroup): TableGroup {
    return dbCreateTableGroup({ name });
}

export function updateTableGroup(
    id: number,
    { name }: UpdateTableGroup,
): TableGroup {
    return dbUpdateTableGroup(id, { name });
}

export function deleteTableGroup(id: number): boolean {
    return dbDeleteTableGroup(id);
}
