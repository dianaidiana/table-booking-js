import {
    dbCreateTableGroup,
    type CreateTableGroup,
} from "../core/table-groups/table-groups.dba.ts";

export const tableGroupsFactory = {
    create: async (overrides: Partial<CreateTableGroup> = {}) => {
        return dbCreateTableGroup({
            name: "Table Group",
            ...overrides,
        });
    },

    createMany: async (
        count: number,
        overrides: Partial<CreateTableGroup> = {},
    ) => {
        const tableGroups = [];
        for (let i = 0; i < count; i++) {
            const tableGroup = await dbCreateTableGroup({
                name: overrides.name ? `${overrides.name} ${i}` : `Group ${i}`,
                ...overrides,
            });
            tableGroups.push(tableGroup);
        }
        return tableGroups;
    },
};
