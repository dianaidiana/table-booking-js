import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { closeDb, initDb } from "../../db-setup.ts";
import {
    listOpeningHours,
    getOpeningHoursByDay,
    updateOpeningHours,
} from "./opening-hours.service.ts";
import { bookingsFactory } from "../../test-factories/bookings.factory.ts";
import { getMinutesFrom00hs } from "../../utils.ts";

describe("opening hours", () => {
    describe("service", () => {
        beforeEach(() => {
            initDb(true);
        });

        afterEach(() => {
            closeDb();
        });

        test("list all", async () => {
            const openingHours = await listOpeningHours();
            expect(openingHours).toHaveLength(7);
        });

        test("get by weekday", async () => {
            const openingHours = await getOpeningHoursByDay(0); // Sunday
            expect(openingHours).toStrictEqual({
                weekday: 0,
                opening_time: "09:00",
                closing_time: "22:00",
                is_closed: false,
            });

            const nonexistantOpeningHours = await getOpeningHoursByDay(7); // Invalid weekday
            expect(nonexistantOpeningHours).toBeUndefined();
        });

        test("update", async () => {
            const updated1 = await updateOpeningHours(1, {
                opening_time: 300,
            });
            expect(updated1.opening_time).toBe(300);

            const updated2 = await updateOpeningHours(2, {
                closing_time: 1000,
            });
            expect(updated2.closing_time).toBe(1000);

            const updated3 = await updateOpeningHours(2, {
                is_closed: true,
            });
            expect(updated3.is_closed).toBe(true);
        });

        test("update empty", async () => {
            const originalOpeningHours = await getOpeningHoursByDay(3);
            const updated = await updateOpeningHours(3, {});
            expect(updated).toStrictEqual(originalOpeningHours);
        });

        test("update to is_closed:true with upcoming bookings conflicting", async () => {
            const tomorrow = Temporal.Now.plainDateISO().add({ days: 1 });
            const openingHours = await updateOpeningHours(
                tomorrow.dayOfWeek % 7,
                {
                    is_closed: false,
                },
            );
            const upcomingBooking = await bookingsFactory.create({
                booking_date: tomorrow.toString(),
                booking_start_time: getMinutesFrom00hs(
                    new Temporal.PlainTime(11, 0),
                ),
                duration_minutes: 120,
            });
            await expect(async () => {
                await updateOpeningHours(openingHours.weekday, {
                    is_closed: true,
                });
            }).rejects.toThrow();
        });

        test("update openingTime with upcoming bookings conflicting", async () => {
            const tomorrow = Temporal.Now.plainDateISO().add({ days: 1 });
            const openingHours = await updateOpeningHours(
                tomorrow.dayOfWeek % 7,
                {
                    is_closed: false,
                },
            );
            const upcomingBooking = await bookingsFactory.create({
                booking_date: tomorrow.toString(),
                booking_start_time: getMinutesFrom00hs(
                    new Temporal.PlainTime(11, 0),
                ),
                duration_minutes: 120,
            });
            await expect(async () => {
                await updateOpeningHours(openingHours.weekday, {
                    opening_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(12, 0),
                    ),
                });
            }).rejects.toThrow();
        });

        test("update to closingTime with upcoming bookings conflicting", async () => {
            const tomorrow = Temporal.Now.plainDateISO().add({ days: 1 });
            const openingHours = await updateOpeningHours(
                tomorrow.dayOfWeek % 7,
                {
                    is_closed: false,
                },
            );
            const upcomingBooking = await bookingsFactory.create({
                booking_date: tomorrow.toString(),
                booking_start_time: getMinutesFrom00hs(
                    new Temporal.PlainTime(11, 0),
                ),
                duration_minutes: 120,
            });
            await expect(async () => {
                await updateOpeningHours(openingHours.weekday, {
                    closing_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(12, 0),
                    ),
                });
            }).rejects.toThrow();
        });
    });
});
