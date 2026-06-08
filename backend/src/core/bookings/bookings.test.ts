import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { closeDb, initDb } from "../../db-setup.ts";
import { tablesFactory } from "../../test-factories/tables.factory.ts";
import { bookingsFactory } from "../../test-factories/bookings.factory.ts";
import { listBookings } from "./bookings.service.ts";
import { getMinutesFrom00hs } from "../../utils.ts";

describe("bookings", () => {
    describe("service", () => {
        beforeEach(() => {
            initDb(true);
        });

        afterEach(() => {
            closeDb();
        });

        describe("list all with filters", () => {
            test("specific date", async () => {
                const tables = await tablesFactory.createMany(2);
                const booking1 = await bookingsFactory.create({
                    table_id: tables[0]!.id,
                    booking_date: Temporal.Now.plainDateISO()
                        .add({ days: 1 })
                        .toString(),
                });
                const booking2 = await bookingsFactory.create({
                    table_id: tables[1]!.id,
                    booking_date: Temporal.Now.plainDateISO()
                        .add({ days: 2 })
                        .toString(),
                });
                const result = await listBookings({
                    specificDate: Temporal.Now.plainDateISO()
                        .add({ days: 1 })
                        .toString(),
                });
                expect(result).toStrictEqual([booking1]);
            });
            test("start and end date", async () => {
                const tables = await tablesFactory.createMany(4);
                const dates = [];
                for (let i = 0; i <= 4; i++) {
                    dates.push(
                        Temporal.Now.plainDateISO().add({ days: i }).toString(),
                    );
                }
                const booking1 = await bookingsFactory.create({
                    table_id: tables[0]!.id,
                    booking_date: dates[0]!,
                });
                const booking2 = await bookingsFactory.create({
                    table_id: tables[1]!.id,
                    booking_date: dates[1]!,
                });
                const booking3 = await bookingsFactory.create({
                    table_id: tables[2]!.id,
                    booking_date: dates[2]!,
                });
                const booking4 = await bookingsFactory.create({
                    table_id: tables[3]!.id,
                    booking_date: dates[3]!,
                });
                const result = await listBookings({
                    startDate: dates[1],
                    endDate: dates[2],
                });
                expect(result).toStrictEqual([booking2, booking3]);
            });
            test("weekday", async () => {
                const tables = await tablesFactory.createMany(4);
                const dates = [];
                for (let i = 0; i <= 4; i++) {
                    dates.push(Temporal.Now.plainDateISO().add({ days: i }));
                }
                const booking1 = await bookingsFactory.create({
                    table_id: tables[0]!.id,
                    booking_date: dates[0]!.toString(),
                });
                const booking2 = await bookingsFactory.create({
                    table_id: tables[1]!.id,
                    booking_date: dates[1]!.toString(),
                });
                const booking3 = await bookingsFactory.create({
                    table_id: tables[2]!.id,
                    booking_date: dates[2]!.toString(),
                });
                const booking4 = await bookingsFactory.create({
                    table_id: tables[3]!.id,
                    booking_date: dates[3]!.toString(),
                });
                const result = await listBookings({
                    weekday: dates[2]!.dayOfWeek % 7,
                });
                expect(result).toStrictEqual([booking3]);
            });
            test("startTime with specific date", async () => {
                const tables = await tablesFactory.createMany(4);
                const date = Temporal.Now.plainDateISO().add({ days: 1 });
                const booking1 = await bookingsFactory.create({
                    table_id: tables[0]!.id,
                    booking_date: date.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(9, 0),
                    ),
                    duration_minutes: 130,
                });
                const booking2 = await bookingsFactory.create({
                    table_id: tables[1]!.id,
                    booking_date: date.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(11, 0),
                    ),
                    duration_minutes: 60,
                });
                const booking3 = await bookingsFactory.create({
                    table_id: tables[2]!.id,
                    booking_date: date.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(12, 0),
                    ),
                    duration_minutes: 60,
                });
                const booking4 = await bookingsFactory.create({
                    table_id: tables[3]!.id,
                    booking_date: date.add({ days: 1 }).toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(14, 0),
                    ),
                });
                const result = await listBookings({
                    specificDate: date.toString(),
                    startTime: getMinutesFrom00hs(
                        new Temporal.PlainTime(11, 0),
                    ),
                });
                expect(result).toStrictEqual([booking1, booking2, booking3]);
            });
        });

        test("list all without filters", async () => {
            const tables = await tablesFactory.createMany(2);
            const booking1 = await bookingsFactory.create({
                table_id: tables[0]!.id,
            });
            const booking2 = await bookingsFactory.create({
                table_id: tables[1]!.id,
            });
            const result = await listBookings({});
            expect(result).toStrictEqual([booking1, booking2]);
        });
    });
});
