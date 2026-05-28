import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { tablesFactory } from "../../test-factories/tables.factory.ts";
import { closeDb, initDb } from "../../db-setup.ts";
import {
    createTable,
    deleteTable,
    getTable,
    listTables,
    updateTable,
} from "./tables.service.ts";
import { tableGroupsFactory } from "../../test-factories/table-groups.factory.ts";
import { bookingsFactory } from "../../test-factories/bookings.factory.ts";

describe("tables", () => {
    describe("service", () => {
        beforeEach(() => {
            initDb(true);
        });

        afterEach(() => {
            closeDb();
        });

        test("list all", async () => {
            const tables = await tablesFactory.createMany(2);
            const result = await listTables();
            expect(result).toStrictEqual(tables);
        });

        test("get by id", async () => {
            const table = await tablesFactory.create();
            const result = await getTable(table.id);
            expect(result).toStrictEqual(table);
        });

        test("get by unexistent id", async () => {
            const undefinedTable = await getTable(10000);
            expect(undefinedTable).toBeUndefined();
        });

        test("create", async () => {
            const tableGroup = await tableGroupsFactory.create();
            const table = await createTable({
                table_group_id: tableGroup.id,
                table_number: "11",
                capacity: 4,
                disabled: false,
            });
            expect(table).toStrictEqual({
                id: table.id,
                table_group_id: tableGroup.id,
                table_number: "11",
                capacity: 4,
                disabled: false,
            });
        });

        test("create with unexistent table_group_id", async () => {
            await expect(async () => {
                await createTable({
                    table_group_id: 1000,
                    table_number: "11",
                    capacity: 4,
                    disabled: false,
                });
            }).rejects.toThrow();
        });
        // TODO: throw should be an instanceof a tailored Error for this case

        test("update everything but disabled", async () => {
            const table = await tablesFactory.create();
            const id = table.id;

            const update1 = await updateTable(id, {
                table_number: "12",
            });
            expect(update1).toStrictEqual({ ...table, table_number: "12" });

            const otherTableGroup = await tableGroupsFactory.create();
            const update2 = await updateTable(id, {
                table_group_id: otherTableGroup.id,
            });
            expect(update2).toStrictEqual({
                ...update1,
                table_group_id: otherTableGroup.id,
            });

            const update3 = await updateTable(id, {
                capacity: 5,
            });
            expect(update3).toStrictEqual({ ...update2, capacity: 5 });
        });

        test("update disabled without bookings", async () => {
            const table = await tablesFactory.create();
            const update = await updateTable(table.id, {
                disabled: true,
            });
            expect(update).toStrictEqual({ ...table, disabled: true });
        });

        console.log(Temporal.Now.plainDateISO().add({ days: 1 }).toString());

        test("update disabled with bookings", async () => {
            const table = await tablesFactory.create();
            const booking = await bookingsFactory.create({
                table_id: table.id,
                booking_date: Temporal.Now.plainDateISO()
                    .add({ days: 2 })
                    .toString(),
            });

            expect(
                async () =>
                    await updateTable(table.id, {
                        disabled: true,
                    }),
            ).rejects.toThrow();
        });

        test("update empty", async () => {
            const table = await tablesFactory.create();
            const update = await updateTable(table.id, {});
            expect(update).toStrictEqual(table);
        });

        test("delete without bookings", async () => {
            const table = await tablesFactory.create();
            const result = await deleteTable(table.id);
            expect(result).toBe(true);
        });

        test("delete with bookings", async () => {
            const table = await tablesFactory.create();
            const booking = await bookingsFactory.create({
                table_id: table.id,
            });
            await expect(deleteTable(table.id)).rejects.toThrow();
        });
    });
});
