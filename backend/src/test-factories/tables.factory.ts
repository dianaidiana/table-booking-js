import { dbCreateTable, type CreateTable } from "../core/tables/tables.dba.ts";

export const tableFactory = {
    create: async (obj: CreateTable) => {
        return dbCreateTable(obj);
    },
};
