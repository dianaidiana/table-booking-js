import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { closeDb, initDb } from "../../db-setup.ts";
import {
    listOpeningHours,
    getOpeningHoursPerDay,
    updateOpeningHours,
} from "./opening-hours.service.ts";

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
            const openingHours = await getOpeningHoursPerDay(0); // Sunday
            expect(openingHours).toStrictEqual({
                weekday: 0,
                opening_time: "09:00",
                closing_time: "22:00",
                is_closed: false,
            });

            const nonexistantOpeningHours = await getOpeningHoursPerDay(7); // Invalid weekday
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
            const originalOpeningHours = await getOpeningHoursPerDay(3);
            const updated = await updateOpeningHours(3, {});
            expect(updated).toStrictEqual(originalOpeningHours);
        });
    });
});
