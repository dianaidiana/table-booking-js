import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { tablesFactory } from "../../test-factories/tables.factory.ts";
import { closeDb, initDb } from "../../db-setup.ts";
import {
    createTable,
    deleteTable,
    getTable,
    listTables,
    TableHasBookingsUpdateError,
    updateTable,
} from "./tables.service.ts";
import { tableGroupsFactory } from "../../test-factories/table-groups.factory.ts";
import { bookingsFactory } from "../../test-factories/bookings.factory.ts";
import { getMinutesFrom00hs } from "../../utils.ts";

describe("tables", () => {
    describe("service", () => {
        beforeEach(() => {
            initDb(true);
        });

        afterEach(() => {
            closeDb();
        });

        test("list all", () => {
            const tables = tablesFactory.createMany(2);
            const result = listTables();
            expect(result).toStrictEqual(tables);
        });

        test("get by id", () => {
            const table = tablesFactory.create();
            const result = getTable(table.id);
            expect(result).toStrictEqual(table);
        });

        test("get by unexistent id", () => {
            const undefinedTable = getTable(10000);
            expect(undefinedTable).toBeUndefined();
        });

        test("create", () => {
            const tableGroup = tableGroupsFactory.create();
            const table = createTable({
                table_group_id: tableGroup.id,
                name: "11",
                capacity: 4,
                disabled: false,
            });
            expect(table).toStrictEqual({
                id: table.id,
                table_group_id: tableGroup.id,
                name: "11",
                capacity: 4,
                disabled: false,
                deleted_at: null,
            });
        });

        test("create with unexistent table_group_id", () => {
            expect(() => {
                createTable({
                    table_group_id: 1000,
                    name: "11",
                    capacity: 4,
                    disabled: false,
                });
            }).toThrow();
        });
        // TODO: throw should be an instanceof a tailored Error for this case

        test("update everything but disabled", () => {
            const table = tablesFactory.create();
            const id = table.id;

            const update1 = updateTable(id, {
                name: "12",
            });
            expect(update1).toStrictEqual({ ...table, name: "12" });

            const otherTableGroup = tableGroupsFactory.create();
            const update2 = updateTable(id, {
                table_group_id: otherTableGroup.id,
            });
            expect(update2).toStrictEqual({
                ...update1,
                table_group_id: otherTableGroup.id,
            });

            const update3 = updateTable(id, {
                capacity: 5,
            });
            expect(update3).toStrictEqual({ ...update2, capacity: 5 });
        });

        test("update disabled without bookings", () => {
            const table = tablesFactory.create();
            const update = updateTable(table.id, {
                disabled: true,
            });
            expect(update).toStrictEqual({ ...table, disabled: true });
        });

        test("disable with future bookings", () => {
            const table = tablesFactory.create();
            const booking = bookingsFactory.create({
                table_id: table.id,
                booking_date: Temporal.Now.plainDateISO()
                    .add({ days: 2 })
                    .toString(),
            });

            expect(() =>
                updateTable(table.id, {
                    disabled: true,
                }),
            ).toThrow(TableHasBookingsUpdateError);
        });

        test("disable with future bookings today", () => {
            const table = tablesFactory.create();
            const booking = bookingsFactory.create({
                table_id: table.id,
                booking_date: Temporal.Now.plainDateISO().toString(),
                booking_start_time:
                    getMinutesFrom00hs(Temporal.Now.plainTimeISO()) + 1,
            });

            expect(() =>
                updateTable(table.id, {
                    disabled: true,
                }),
            ).toThrow(TableHasBookingsUpdateError);
        });

        test("disable with past bookings", () => {
            const table = tablesFactory.create();
            const booking = bookingsFactory.create({
                table_id: table.id,
                booking_date: Temporal.Now.plainDateISO()
                    .subtract({ days: 2 })
                    .toString(),
            });

            expect(
                updateTable(table.id, {
                    disabled: true,
                }),
            ).toStrictEqual({ ...table, disabled: true });
        });

        test("disable with past bookings today", () => {
            const table = tablesFactory.create();
            const booking = bookingsFactory.create({
                table_id: table.id,
                booking_date: Temporal.Now.plainDateISO().toString(),
                duration_minutes: 2,
                booking_start_time:
                    getMinutesFrom00hs(Temporal.Now.plainTimeISO()) - 5,
            });

            expect(
                updateTable(table.id, {
                    disabled: true,
                }),
            ).toStrictEqual({ ...table, disabled: true });
        });

        test("update empty", () => {
            const table = tablesFactory.create();
            const update = updateTable(table.id, {});
            expect(update).toStrictEqual(table);
        });

        test("delete without bookings", () => {
            const table = tablesFactory.create();
            const result = deleteTable(table.id);
            expect(result).toBe(true);
        });

        test("delete with past bookings", () => {
            const table = tablesFactory.create();
            const booking = bookingsFactory.create({
                table_id: table.id,
                booking_date: Temporal.Now.plainDateISO()
                    .subtract({ days: 2 })
                    .toString(),
            });

            const result = deleteTable(table.id);
            expect(result).toBe(true);
        });

        test("delete with past bookings today", () => {
            const table = tablesFactory.create();
            const booking = bookingsFactory.create({
                table_id: table.id,
                booking_date: Temporal.Now.plainDateISO().toString(),
                duration_minutes: 2,
                booking_start_time:
                    getMinutesFrom00hs(Temporal.Now.plainTimeISO()) - 5,
            });

            const result = deleteTable(table.id);
            expect(result).toBe(true);
        });

        test("delete with future bookings", () => {
            const table = tablesFactory.create();
            const booking = bookingsFactory.create({
                table_id: table.id,
                booking_date: Temporal.Now.plainDateISO()
                    .add({ days: 2 })
                    .toString(),
            });

            expect(() => deleteTable(table.id)).toThrow(
                TableHasBookingsUpdateError,
            );
        });

        test("delete with future bookings today", () => {
            const table = tablesFactory.create();
            const booking = bookingsFactory.create({
                table_id: table.id,
                booking_date: Temporal.Now.plainDateISO().toString(),
                booking_start_time:
                    getMinutesFrom00hs(Temporal.Now.plainTimeISO()) + 1,
            });

            expect(() => deleteTable(table.id)).toThrow(
                TableHasBookingsUpdateError,
            );
        });
    });
});
