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

        beforeEach(() => {
            db = initDb(true);
        });

        afterEach(() => {
            closeDb();
        });

        test("list all", async () => {
            await tableFactory.createManyDefaultsWithTableGroup(2);
            const tables = await listTables();
            expect(tables).toHaveLength(2);
        });

        test("get by id", async () => {
            const createdTable = (
                await tableFactory.createDefaultWithTableGroup()
            ).table;
            const table = await getTable(1);
            expect(table).toStrictEqual(createdTable);

            const undefinedTable = await getTable(2);
            expect(undefinedTable).toBeUndefined();
        });

        test("create", async () => {
            await tableGroupFactory.create({ name: "Test Group 1" });
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

        test("update everything but disabled", async () => {
            await tableFactory.createDefaultWithTableGroup();
            await tableGroupFactory.create({ name: "Test Group 2" });

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

        test("update disabled without bookings", async () => {
            await tableFactory.createDefaultWithTableGroup();
            const update4 = await updateTable(1, {
                disabled: true,
            });
            expect(update4.disabled).toBe(true);
        });

        test("update disabled with bookings", async () => {
            await tableFactory.createDefaultWithTableGroup();
            const update4 = await updateTable(1, {
                disabled: true,
            });
            // TODO
        });

        test("update empty", async () => {
            await tableGroupFactory.create({ name: "Test Group 1" });
            const originalTable = await tableFactory.create({
                table_group_id: 1,
                table_number: "11",
                capacity: 4,
                disabled: false,
            });
            const table = await updateTable(1, {});
            expect(table).toStrictEqual({ ...originalTable, disabled: false });
        });

        test("delete", async () => {
            await tableGroupFactory.create({ name: "Test Group 1" });
            await tableFactory.create({
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
