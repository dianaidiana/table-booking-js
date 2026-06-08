import { dbCreateTable, type CreateTable } from "../core/tables/tables.dba.ts";
import { tableGroupsFactory } from "./table-groups.factory.ts";

export const tablesFactory = {
    create: async (overrides: Partial<CreateTable> = {}) => {
        let table_group_id = overrides.table_group_id;
        if (!table_group_id) {
            const tableGroup = await tableGroupsFactory.create();
            table_group_id = tableGroup.id;
        }

        return await dbCreateTable({
            table_group_id,
            name: "1",
            capacity: 4,
            disabled: false,
            ...overrides,
        });
    },

    createMany: async (count: number, overrides: Partial<CreateTable> = {}) => {
        const tables = [];
        for (let i = 0; i < count; i++) {
            const table = await tablesFactory.create({
                name: overrides.name ? `${overrides.name + i}` : `${i}`,
                ...overrides,
            });
            tables.push(table);
        }
        return tables;
    },
};
