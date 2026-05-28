import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { closeDb, initDb } from "../../db-setup.ts";
import {
    createTableGroup,
    deleteTableGroup,
    getTableGroup,
    listTableGroups,
    updateTableGroup,
} from "./table-groups.service.ts";
import { tableGroupsFactory } from "../../test-factories/table-groups.factory.ts";
import { tablesFactory } from "../../test-factories/tables.factory.ts";
import { TableGroupHasTablesDeleteError } from "./table-groups.dba.ts";

describe("table-groups", () => {
    describe("service", () => {
        beforeEach(() => {
            initDb(true);
        });

        afterEach(() => {
            closeDb();
        });

        test("list all", async () => {
            const tableGroups = await tableGroupsFactory.createMany(5);
            const result = await listTableGroups();
            expect(result).toStrictEqual(tableGroups);
        });

        test("get by id", async () => {
            const tableGroup = await tableGroupsFactory.create();
            const result = await getTableGroup(tableGroup.id);
            expect(result).toStrictEqual(tableGroup);
        });

        test("get by unexistent id", async () => {
            const undefinedTableGroup = await getTableGroup(10000);
            expect(undefinedTableGroup).toBeUndefined();
        });

        test("create", async () => {
            const tableGroup = await createTableGroup({
                name: "Test Group 1",
            });
            expect(tableGroup).toStrictEqual({
                id: 1,
                name: "Test Group 1",
            });
        });

        test("update", async () => {
            const tableGroup = await tableGroupsFactory.create();
            const newName = tableGroup.name + " adapted";
            const result = await updateTableGroup(1, {
                name: newName,
            });
            expect(result).toStrictEqual({
                ...tableGroup,
                name: newName,
            });
        });

        test("update unexistent", async () => {
            await expect(async () => {
                await updateTableGroup(1, {
                    name: "asd",
                });
            }).rejects.toThrow();
        });

        test("update empty", async () => {
            const tableGroup = await tableGroupsFactory.create();
            const result = await updateTableGroup(tableGroup.id, {});
            expect(result).toStrictEqual(tableGroup);
        });

        test("delete with table", async () => {
            const tableGroup = await tableGroupsFactory.create();
            const table = await tablesFactory.create({
                table_group_id: tableGroup.id,
            });
            await expect(deleteTableGroup(tableGroup.id)).rejects.instanceOf(
                TableGroupHasTablesDeleteError,
            );
        });

        test("delete without table", async () => {
            const tableGroup = await tableGroupsFactory.create();
            const result = await deleteTableGroup(tableGroup.id);
            expect(result).toBe(true);
        });
    });
});
