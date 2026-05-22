import { dbCreateTableGroup } from "../core/table-groups/table-groups.dba.ts";
import {
    dbCreateTable,
    type CreateTable,
    type Table,
} from "../core/tables/tables.dba.ts";

export const tableFactory = {
    create: async (obj: CreateTable) => {
        return dbCreateTable(obj);
    },
    createDefaultWithTableGroup: async () => {
        const createTableGroup = { name: "Table Group 1" };
        const tableGroup = await dbCreateTableGroup(createTableGroup);

        const createTable = {
            table_group_id: 1,
            table_number: "1",
            capacity: 4,
            disabled: false,
        };
        const table = await dbCreateTable(createTable);
        return { tableGroup: tableGroup, table: table };
    },
    createManyDefaultsWithTableGroup: async (numberOfTables: number) => {
        const createTableGroup = { name: "Table Group 1" };
        const tableGroup = await dbCreateTableGroup(createTableGroup);

        const tables: Table[] = [];
        for (let i = 0; i < numberOfTables; i++) {
            const createTable = {
                table_group_id: 1,
                table_number: "" + i,
                capacity: 4,
                disabled: false,
            };
            const table = await dbCreateTable(createTable);
            tables.push(table);
        }

        return { tableGroup: tableGroup, tables: tables };
    },
};
