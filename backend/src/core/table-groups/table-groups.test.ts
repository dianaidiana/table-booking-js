import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { closeDb, initDb } from "../../db-setup.ts";
import {
    createTableGroup,
    deleteTableGroup,
    getTableGroup,
    listTableGroups,
    updateTableGroup,
} from "./table-groups.service.ts";
import { factory } from "../../test-factories/seeds.factory.ts";

describe("table-groups", () => {
    describe("service", () => {
        let db;

        beforeEach(() => {
            db = initDb(true);
        });

        afterEach(() => {
            closeDb();
        });

        test("list all", async () => {
            await factory.createManyDefaultTableGroups(5);
            const tableGroups = await listTableGroups();
            expect(tableGroups).toHaveLength(5);
        });

        test("get by id", async () => {
            const tableGroup = await factory.createDefaultTableGroup();
            const result = await getTableGroup(tableGroup.id);
            expect(result).toStrictEqual(tableGroup);

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
            const tableGroup = await factory.createDefaultTableGroup();
            const newName = tableGroup.name + "adapted";
            const result = await updateTableGroup(1, {
                name: newName,
            });
            expect(result).toStrictEqual({
                ...tableGroup,
                name: newName,
            });
        });

        test("update empty", async () => {
            const tableGroup = await factory.createDefaultTableGroup();
            const result = await updateTableGroup(1, {});
            expect(result).toStrictEqual(tableGroup);
        });

        test("delete with table", async () => {
            const { tableGroup } =
                await factory.createDefaultTableGroupWithTable();
            await expect(deleteTableGroup(tableGroup.id)).rejects.toThrow();
        });

        test("delete without table", async () => {
            const tableGroup = await factory.createDefaultTableGroup();
            const result = await deleteTableGroup(tableGroup.id);
            expect(result).toBe(true);
        });
    });
});
