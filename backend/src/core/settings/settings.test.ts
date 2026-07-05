import { beforeAll, describe, expect, test } from "vitest";
import { getSettings, updateSettings } from "./settings.service.ts";
import { initDb } from "../../db-setup.ts";

beforeAll(() => {
    initDb(true);
});

describe("settings", () => {
    describe("service", () => {
        test("get", () => {
            const settings = getSettings();
            expect(settings).toHaveProperty("booking_duration");
        });

        test("update", () => {
            const origSettings = getSettings();
            const settings = updateSettings({ booking_duration: 10 });
            expect(settings).toStrictEqual({
                ...origSettings,
                booking_duration: 10,
            });
        });

        test("update empty", () => {
            const origSettings = getSettings();
            const settings = updateSettings({});
            expect(settings).toStrictEqual(origSettings);
        });
    });
});
