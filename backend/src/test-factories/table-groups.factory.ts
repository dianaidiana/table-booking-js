import {
    dbCreateTableGroup,
    type CreateTableGroup,
} from "../core/table-groups/table-groups.dba.ts";

export const tableGroupFactory = {
    create: async (obj: CreateTableGroup) => {
        return dbCreateTableGroup(obj);
    },
};
