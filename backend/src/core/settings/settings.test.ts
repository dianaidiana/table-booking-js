import { beforeAll, describe, expect, test } from "vitest";
import { getSettings, updateSettings } from "./settings.service.ts";
import { initDb } from "../../db-setup.ts";

beforeAll(() => {
    initDb(true);
});

describe("settings", () => {
    describe("service", () => {
        test("get", async () => {
            const settings = await getSettings();
            expect(settings).toHaveProperty("booking_duration");
        });

        test("update", async () => {
            const origSettings = await getSettings();
            const settings = await updateSettings({ booking_duration: 10 });
            expect(settings).toStrictEqual({
                ...origSettings,
                booking_duration: 10,
            });
        });

        test("update empty", async () => {
            const origSettings = await getSettings();
            const settings = await updateSettings({});
            expect(settings).toStrictEqual(origSettings);
        });
    });
});
