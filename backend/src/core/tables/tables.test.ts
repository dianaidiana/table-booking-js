import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { tableFactory } from "../../test-factories/tables.factory.ts";
import { closeDb, initDb } from "../../db-setup.ts";
import {
    createTable,
    deleteTable,
    getTable,
    listTables,
    updateTable,
} from "./tables.service.ts";
import { tableGroupFactory } from "../../test-factories/table-groups.factory.ts";

describe("tables", () => {
    describe("service", () => {
        let db;
        let factory: ReturnType<typeof tableFactory>;
        let tgFactory: ReturnType<typeof tableGroupFactory>;

        beforeEach(() => {
            db = initDb(true);
            factory = tableFactory(db);
            tgFactory = tableGroupFactory(db);
        });

        afterEach(() => {
            closeDb();
        });

        test("list all", async () => {
            await tgFactory.create({ name: "Test Group 1" });
            await factory.create({
                table_group_id: 1,
                table_number: "1",
                capacity: 4,
                disabled: false,
            });
            await factory.create({
                table_group_id: 1,
                table_number: "2",
                capacity: 2,
                disabled: false,
            });
            const tables = await listTables();
            expect(tables).toHaveLength(2);
        });

        test("get by id", async () => {
            await tgFactory.create({ name: "Test Group 1" });
            const createdTable = await factory.create({
                table_group_id: 1,
                table_number: "11",
                capacity: 4,
                disabled: false,
            });
            const table = await getTable(1);
            expect(table).toStrictEqual({ ...createdTable, disabled: false });

            const undefinedTable = await getTable(2);
            expect(undefinedTable).toBeUndefined();
        });

        test("create", async () => {
            await tgFactory.create({ name: "Test Group 1" });
            const table = await createTable({
                table_group_id: 1,
                table_number: "11",
                capacity: 4,
                disabled: false,
            });
            expect(table).toStrictEqual({
                id: 1,
                table_group_id: 1,
                table_number: "11",
                capacity: 4,
                disabled: false,
            });
        });

        test("update", async () => {
            await tgFactory.create({ name: "Test Group 1" });
            await tgFactory.create({ name: "Test Group 2" });
            await factory.create({
                table_group_id: 1,
                table_number: "11",
                capacity: 4,
                disabled: false,
            });
            const update1 = await updateTable(1, {
                table_number: "12",
            });
            expect(update1.table_number).toBe("12");

            const update2 = await updateTable(1, {
                table_group_id: 2,
            });
            expect(update2.table_group_id).toBe(2);

            const update3 = await updateTable(1, {
                capacity: 5,
            });
            expect(update3.capacity).toBe(5);

            const update4 = await updateTable(1, {
                disabled: true,
            });
            expect(update4.disabled).toBe(true);
        });

        test("update empty", async () => {
            await tgFactory.create({ name: "Test Group 1" });
            const originalTable = await factory.create({
                table_group_id: 1,
                table_number: "11",
                capacity: 4,
                disabled: false,
            });
            const table = await updateTable(1, {});
            expect(table).toStrictEqual({ ...originalTable, disabled: false });
        });

        test("delete", async () => {
            await tgFactory.create({ name: "Test Group 1" });
            await factory.create({
                table_group_id: 1,
                table_number: "11",
                capacity: 4,
                disabled: false,
            });
            const deleted = await deleteTable(1);
            expect(deleted).toBe(true);
            const table = await getTable(1);
            expect(table).toBeUndefined();
        });
    });
});
