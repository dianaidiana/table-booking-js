import { dbListTables } from "../tables/tables.dba.ts";
import { NotFoundError } from "../../errors.ts";
import { tableGroupMessages } from "../../error-messages.ts";
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

export function getTableGroup(id: number): TableGroup {
    const tableGroup = dbGetTableGroup(id);
    if (!tableGroup) {
        throw new NotFoundError(tableGroupMessages.notFound(id));
    }
    return tableGroup;
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

export function deleteTableGroup(id: number): void {
    const wasDeleted = dbDeleteTableGroup(id);
    if (!wasDeleted) {
        throw new NotFoundError(tableGroupMessages.notFound(id));
    }
}
