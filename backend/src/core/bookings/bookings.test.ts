import { afterEach, beforeEach, describe, test } from "vitest";
import { closeDb, initDb } from "../../db-setup.ts";
import { tablesFactory } from "../../test-factories/tables.factory.ts";
import { bookingsFactory } from "../../test-factories/bookings.factory.ts";

describe("bookings", () => {
    describe("service", () => {
        let db;

        beforeEach(() => {
            db = initDb(true);
        });

        afterEach(() => {
            closeDb();
        });

        test("list all", async () => {
            const booking1 = bookingsFactory.create();
            // {
            //     table_id: table.id,
            //     booking_date: "2026-01-01",
            // });
        });
    });
});
