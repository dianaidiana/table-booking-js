import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { closeDb, getDb, initDb } from "../../db-setup.ts";
import {
    createTableGroup,
    deleteTableGroup,
    getTableGroup,
    listTableGroups,
    updateTableGroup,
} from "./table-groups.service.ts";
import { tableGroupFactory } from "../../test-factories/table-groups.factory.ts";

describe("table-groups", () => {
    describe("service", () => {
        let db;
        let factory: ReturnType<typeof tableGroupFactory>;

        beforeEach(() => {
            db = initDb(true);
            factory = tableGroupFactory(db);
        });

        afterEach(() => {
            closeDb();
        });

        test("list all", async () => {
            await factory.create({ name: "Test Group 1" });
            await factory.create({ name: "Test Group 2" });
            const tableGroups = await listTableGroups();
            expect(tableGroups).toHaveLength(2);
        });

        test("get by id", async () => {
            const createdTableGroup = await factory.create({
                name: "Test Group 1",
            });
            const tableGroup = await getTableGroup(1);
            expect(tableGroup).toStrictEqual(createdTableGroup);

            const undefinedTableGroup = await getTableGroup(2);
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
            await factory.create({ name: "Test Group 1" });
            const tableGroup = await updateTableGroup(1, {
                name: "Test Group 1 adapted",
            });
            expect(tableGroup).toStrictEqual({
                ...tableGroup,
                name: "Test Group 1 adapted",
            });
        });

        test("update empty", async () => {
            const originalTableGroup = await factory.create({
                name: "Test Group 1",
            });
            const tableGroup = await updateTableGroup(1, {});
            expect(tableGroup).toStrictEqual(originalTableGroup);
        });

        test("delete", async () => {
            await factory.create({ name: "Test Group 1" });
            const deleted = await deleteTableGroup(1);
            expect(deleted).toBe(true);
            const tableGroup = await getTableGroup(1);
            expect(tableGroup).toBeUndefined();
        });
    });
});
