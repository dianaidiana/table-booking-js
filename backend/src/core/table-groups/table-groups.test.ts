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

        test("list all", () => {
            const tableGroups = tableGroupsFactory.createMany(5);
            const result = listTableGroups();
            expect(result).toStrictEqual(tableGroups);
        });

        test("get by id", () => {
            const tableGroup = tableGroupsFactory.create();
            const result = getTableGroup(tableGroup.id);
            expect(result).toStrictEqual(tableGroup);
        });

        test("get by unexistent id", () => {
            const undefinedTableGroup = getTableGroup(10000);
            expect(undefinedTableGroup).toBeUndefined();
        });

        test("create", () => {
            const tableGroup = createTableGroup({
                name: "Test Group 1",
            });
            expect(tableGroup).toStrictEqual({
                id: 1,
                name: "Test Group 1",
            });
        });

        test("update", () => {
            const tableGroup = tableGroupsFactory.create();
            const newName = tableGroup.name + " adapted";
            const result = updateTableGroup(1, {
                name: newName,
            });
            expect(result).toStrictEqual({
                ...tableGroup,
                name: newName,
            });
        });

        test("update unexistent", () => {
            expect(() => {
                updateTableGroup(1, {
                    name: "asd",
                });
            }).toThrow();
        });

        test("update empty", () => {
            const tableGroup = tableGroupsFactory.create();
            const result = updateTableGroup(tableGroup.id, {});
            expect(result).toStrictEqual(tableGroup);
        });

        test("delete with table", () => {
            const tableGroup = tableGroupsFactory.create();
            const table = tablesFactory.create({
                table_group_id: tableGroup.id,
            });
            expect(() => deleteTableGroup(tableGroup.id)).toThrow(
                TableGroupHasTablesDeleteError,
            );
        });

        test("delete without table", () => {
            const tableGroup = tableGroupsFactory.create();
            const result = deleteTableGroup(tableGroup.id);
            expect(result).toBe(true);
        });
    });
});
