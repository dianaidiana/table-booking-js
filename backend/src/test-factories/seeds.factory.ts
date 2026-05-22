import { randomUUID } from "node:crypto";
import {
    dbCreateBooking,
    type CreateBooking,
} from "../core/bookings/bookings.dba.ts";
import {
    dbCreateTableGroup,
    type CreateTableGroup,
} from "../core/table-groups/table-groups.dba.ts";
import { dbCreateTable, type CreateTable } from "../core/tables/tables.dba.ts";

export const factory = {
    createTableGroup: async (obj: CreateTableGroup) => {
        return dbCreateTableGroup(obj);
    },
    createDefaultTableGroup: async () => {
        return dbCreateTableGroup({ name: "table group 1" });
    },
    createManyDefaultTableGroups: async (numberOfTableGroups: number) => {
        const tableGroups = [];
        for (let i = 0; i < numberOfTableGroups; i++) {
            const tableGroup = dbCreateTableGroup({ name: "table group 1" });
            tableGroups.push(tableGroup);
        }
        return tableGroups;
    },
    createTable: async (obj: CreateTable) => {
        return dbCreateTable(obj);
    },
    createDefaultTableGroupWithTable: async () => {
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
    createDefaultTableGroupWithManyTables: async (numberOfTables: number) => {
        const createTableGroup = { name: "Table Group 1" };
        const tableGroup = await dbCreateTableGroup(createTableGroup);

        const tables = [];
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
    createBooking: async (createBooking: CreateBooking) => {
        const bookingSecret = randomUUID();
        return dbCreateBooking(createBooking, bookingSecret);
    },
    createDefaultBooking: async () => {
        const bookingSecret = randomUUID();
        // return dbCreateBooking({

        // }, bookingSecret);
    },
};
