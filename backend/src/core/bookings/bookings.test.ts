import { afterEach, beforeEach, describe, test } from "vitest";
import { closeDb, initDb } from "../../db-setup.ts";
import { bookingFactory } from "../../test-factories/bookings.factory.ts";
import { tableFactory } from "../../test-factories/tables.factory.ts";
import { tableGroupFactory } from "../../test-factories/table-groups.factory.ts";

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
            await tableGroupFactory.create({ name: "Test Group 1" });
            await tableFactory.create({
                table_group_id: 1,
                table_number: "1",
                capacity: 4,
                disabled: false,
            });
            // await bookingFactory.create({
            //     table_id: 1,

            // });
        });
    });
});
