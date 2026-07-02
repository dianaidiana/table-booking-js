import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { closeDb, initDb } from "../../db-setup.ts";
import { tablesFactory } from "../../test-factories/tables.factory.ts";
import { bookingsFactory } from "../../test-factories/bookings.factory.ts";
import {
    createBooking,
    getBooking,
    listBookings,
    updateBooking,
} from "./bookings.service.ts";
import { getMinutesFrom00hs } from "../../utils.ts";
import { deleteTable, updateTable } from "../tables/tables.service.ts";
import { updateOpeningHours } from "../opening-hours/opening-hours.service.ts";
import { validate as uuidValidate } from "uuid";

describe("bookings", () => {
    describe("service", () => {
        beforeEach(() => {
            initDb(true);
        });

        afterEach(() => {
            closeDb();
        });

        describe("list all with filters", () => {
            test("by specific date", async () => {
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

            test("by startDate and endDate", async () => {
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

            test("by startDate", async () => {
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
                });
                expect(result).toStrictEqual([booking2, booking3, booking4]);
            });

            test("by endDate", async () => {
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
                    endDate: dates[1],
                });
                expect(result).toStrictEqual([booking1, booking2]);
            });

            test("by weekday", async () => {
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

            test("by startTime with specificDate", async () => {
                const tables = await tablesFactory.createMany(5);
                const tomorrow = Temporal.Now.plainDateISO().add({ days: 1 });
                const dayAfterTomorrow = tomorrow.add({ days: 1 });
                const booking0 = await bookingsFactory.create({
                    table_id: tables[0]!.id,
                    booking_date: tomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(9, 0),
                    ),
                    duration_minutes: 60,
                });
                const booking1 = await bookingsFactory.create({
                    table_id: tables[0]!.id,
                    booking_date: tomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(10, 0),
                    ),
                    duration_minutes: 61,
                });
                const booking2 = await bookingsFactory.create({
                    table_id: tables[1]!.id,
                    booking_date: tomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(11, 0),
                    ),
                    duration_minutes: 60,
                });
                const booking3 = await bookingsFactory.create({
                    table_id: tables[2]!.id,
                    booking_date: tomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(12, 0),
                    ),
                    duration_minutes: 60,
                });
                const booking4 = await bookingsFactory.create({
                    table_id: tables[3]!.id,
                    booking_date: dayAfterTomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(14, 0),
                    ),
                });
                const result = await listBookings({
                    specificDate: tomorrow.toString(),
                    startTime: getMinutesFrom00hs(
                        new Temporal.PlainTime(11, 0),
                    ),
                });
                expect(result).toStrictEqual([booking1, booking2, booking3]);
            });

            test("by endTime with specificDate", async () => {
                const tables = await tablesFactory.createMany(5);
                const tomorrow = Temporal.Now.plainDateISO().add({ days: 1 });
                const dayAfterTomorrow = tomorrow.add({ days: 1 });
                const booking0 = await bookingsFactory.create({
                    table_id: tables[0]!.id,
                    booking_date: tomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(9, 0),
                    ),
                    duration_minutes: 60,
                });
                const booking1 = await bookingsFactory.create({
                    table_id: tables[0]!.id,
                    booking_date: tomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(10, 0),
                    ),
                    duration_minutes: 61,
                });
                const booking2 = await bookingsFactory.create({
                    table_id: tables[1]!.id,
                    booking_date: tomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(11, 0),
                    ),
                    duration_minutes: 60,
                });
                const booking3 = await bookingsFactory.create({
                    table_id: tables[2]!.id,
                    booking_date: tomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(12, 0),
                    ),
                    duration_minutes: 60,
                });
                const booking4 = await bookingsFactory.create({
                    table_id: tables[3]!.id,
                    booking_date: dayAfterTomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(14, 0),
                    ),
                });
                const result = await listBookings({
                    specificDate: tomorrow.toString(),
                    endTime: getMinutesFrom00hs(new Temporal.PlainTime(11, 0)),
                });
                expect(result).toStrictEqual([booking0, booking1]);
            });

            test("by startTime with startDate", async () => {
                const tables = await tablesFactory.createMany(5);
                const tomorrow = Temporal.Now.plainDateISO().add({ days: 1 });
                const dayAfterTomorrow = tomorrow.add({ days: 1 });
                const booking0 = await bookingsFactory.create({
                    table_id: tables[0]!.id,
                    booking_date: tomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(9, 0),
                    ),
                    duration_minutes: 60,
                });
                const booking1 = await bookingsFactory.create({
                    table_id: tables[0]!.id,
                    booking_date: tomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(10, 0),
                    ),
                    duration_minutes: 61,
                });
                const booking2 = await bookingsFactory.create({
                    table_id: tables[1]!.id,
                    booking_date: tomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(11, 0),
                    ),
                    duration_minutes: 60,
                });
                const booking3 = await bookingsFactory.create({
                    table_id: tables[2]!.id,
                    booking_date: tomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(12, 0),
                    ),
                    duration_minutes: 60,
                });
                const booking4 = await bookingsFactory.create({
                    table_id: tables[3]!.id,
                    booking_date: dayAfterTomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(9, 0),
                    ),
                });
                const result = await listBookings({
                    startDate: tomorrow.toString(),
                    startTime: getMinutesFrom00hs(
                        new Temporal.PlainTime(11, 0),
                    ),
                });
                expect(result).toStrictEqual([
                    booking1,
                    booking2,
                    booking3,
                    booking4,
                ]);
            });

            test("by endTime with endDate", async () => {
                const tables = await tablesFactory.createMany(5);
                const tomorrow = Temporal.Now.plainDateISO().add({ days: 1 });
                const dayAfterTomorrow = tomorrow.add({ days: 1 });
                const booking0 = await bookingsFactory.create({
                    table_id: tables[0]!.id,
                    booking_date: tomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(9, 0),
                    ),
                    duration_minutes: 60,
                });
                const booking1 = await bookingsFactory.create({
                    table_id: tables[0]!.id,
                    booking_date: tomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(10, 0),
                    ),
                    duration_minutes: 61,
                });
                const booking2 = await bookingsFactory.create({
                    table_id: tables[1]!.id,
                    booking_date: dayAfterTomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(11, 0),
                    ),
                    duration_minutes: 60,
                });
                const booking3 = await bookingsFactory.create({
                    table_id: tables[2]!.id,
                    booking_date: dayAfterTomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(12, 0),
                    ),
                    duration_minutes: 60,
                });
                const booking4 = await bookingsFactory.create({
                    table_id: tables[3]!.id,
                    booking_date: dayAfterTomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(15, 0),
                    ),
                });
                const result = await listBookings({
                    endDate: dayAfterTomorrow.toString(),
                    endTime: getMinutesFrom00hs(new Temporal.PlainTime(12, 0)),
                });
                expect(result).toStrictEqual([booking0, booking1, booking2]);
            });

            test("including cancelled true", async () => {
                const tables = await tablesFactory.createMany(3);
                const booking0 = await bookingsFactory.create({
                    table_id: tables[0]!.id,
                    status: "CANCELLED",
                });
                const booking1 = await bookingsFactory.create({
                    table_id: tables[0]!.id,
                });
                const result = await listBookings({
                    includeCancelled: true,
                });
                expect(result).toStrictEqual([booking0, booking1]);
            });

            test("including cancelled false", async () => {
                const tables = await tablesFactory.createMany(2);
                const booking0 = await bookingsFactory.create({
                    table_id: tables[0]!.id,
                    status: "CANCELLED",
                });
                const booking1 = await bookingsFactory.create({
                    table_id: tables[1]!.id,
                });
                const result = await listBookings({
                    includeCancelled: false,
                });
                expect(result).toStrictEqual([booking1]);
            });

            test("by tableId", async () => {
                const tables = await tablesFactory.createMany(2);
                const booking0 = await bookingsFactory.create({
                    table_id: tables[0]!.id,
                });
                const booking1 = await bookingsFactory.create({
                    table_id: tables[1]!.id,
                });
                const result = await listBookings({
                    tableId: tables[0]!.id,
                });
                expect(result).toStrictEqual([booking0]);
            });

            test("by nonexistent tableId", async () => {
                const tables = await tablesFactory.createMany(2);
                const booking0 = await bookingsFactory.create({
                    table_id: tables[0]!.id,
                });
                const booking1 = await bookingsFactory.create({
                    table_id: tables[1]!.id,
                });
                const result = await listBookings({
                    tableId: 100,
                });
                expect(result).toStrictEqual([]);
            });

            test("by guestEmail", async () => {
                const tables = await tablesFactory.createMany(2);
                const booking0 = await bookingsFactory.create({
                    table_id: tables[0]!.id,
                    guest_email: "ex@example.com",
                });
                const booking1 = await bookingsFactory.create({
                    table_id: tables[1]!.id,
                });
                const result = await listBookings({
                    guestEmail: "ex@example.com",
                });
                expect(result).toStrictEqual([booking0]);
            });

            test("by nonexistent guestEmail", async () => {
                const tables = await tablesFactory.createMany(2);
                const booking0 = await bookingsFactory.create({
                    table_id: tables[0]!.id,
                });
                const booking1 = await bookingsFactory.create({
                    table_id: tables[1]!.id,
                });
                const result = await listBookings({
                    guestEmail: "ex@example.com",
                });
                expect(result).toStrictEqual([]);
            });

            test("excluding id", async () => {
                const tables = await tablesFactory.createMany(2);
                const booking0 = await bookingsFactory.create({
                    table_id: tables[0]!.id,
                });
                const booking1 = await bookingsFactory.create({
                    table_id: tables[1]!.id,
                });
                const result = await listBookings({
                    exclude: booking1.id,
                });
                expect(result).toStrictEqual([booking0]);
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

        test("get by id", async () => {
            const booking = await bookingsFactory.create();
            const result = await getBooking(booking.id);
            expect(result).toStrictEqual(booking);
        });

        test("get by unexistant id", async () => {
            const undefinedBooking = await getBooking(1000);
            expect(undefinedBooking).toBeUndefined();
        });

        describe("create", () => {
            test("with unexistent table_id", async () => {
                await expect(async () => {
                    await createBooking({
                        table_id: 1000,
                        booking_date: Temporal.Now.plainDateISO()
                            .add({ days: 1 })
                            .toString(),
                        booking_start_time: getMinutesFrom00hs(
                            new Temporal.PlainTime(9, 0),
                        ),
                        pax: 3,
                        guest_first_name: "John",
                        guest_last_name: "Doe",
                        guest_email: "example@example.com",
                        guest_phone: "+4369955556666",
                        status: "PENDING",
                    });
                }).rejects.toThrow();
            });

            test("with disabled table", async () => {
                const table = await tablesFactory.create({
                    disabled: true,
                    capacity: 5,
                });
                await expect(async () => {
                    await createBooking({
                        table_id: table.id,
                        booking_date: Temporal.Now.plainDateISO()
                            .add({ days: 1 })
                            .toString(),
                        booking_start_time: getMinutesFrom00hs(
                            new Temporal.PlainTime(9, 0),
                        ),
                        pax: 3,
                        guest_first_name: "John",
                        guest_last_name: "Doe",
                        guest_email: "example@example.com",
                        guest_phone: "+4369955556666",
                        status: "PENDING",
                    });
                }).rejects.toThrow();
            });

            test("with table capacity below pax", async () => {
                const table = await tablesFactory.create({
                    capacity: 2,
                });
                await expect(async () => {
                    await createBooking({
                        table_id: table.id,
                        booking_date: Temporal.Now.plainDateISO()
                            .add({ days: 1 })
                            .toString(),
                        booking_start_time: getMinutesFrom00hs(
                            new Temporal.PlainTime(9, 0),
                        ),
                        pax: 3,
                        guest_first_name: "John",
                        guest_last_name: "Doe",
                        guest_email: "example@example.com",
                        guest_phone: "+4369955556666",
                        status: "PENDING",
                    });
                }).rejects.toThrow();
            });

            test("with table deleted", async () => {
                const table = await tablesFactory.create();
                const result = await deleteTable(table.id);
                expect(result).toBe(true);
                await expect(async () => {
                    await createBooking({
                        table_id: table.id,
                        booking_date: Temporal.Now.plainDateISO()
                            .add({ days: 1 })
                            .toString(),
                        booking_start_time: getMinutesFrom00hs(
                            new Temporal.PlainTime(9, 0),
                        ),
                        pax: 3,
                        guest_first_name: "John",
                        guest_last_name: "Doe",
                        guest_email: "example@example.com",
                        guest_phone: "+4369955556666",
                        status: "PENDING",
                    });
                }).rejects.toThrow();
            });

            test("on a closed day", async () => {
                const table = await tablesFactory.create();
                const tomorrow = Temporal.Now.plainDateISO().add({ days: 1 });
                const openingHours = await updateOpeningHours(
                    tomorrow.dayOfWeek % 7,
                    { is_closed: true },
                );
                await expect(async () => {
                    await createBooking({
                        table_id: table.id,
                        booking_date: tomorrow.toString(),
                        booking_start_time: getMinutesFrom00hs(
                            new Temporal.PlainTime(9, 0),
                        ),
                        pax: 3,
                        guest_first_name: "John",
                        guest_last_name: "Doe",
                        guest_email: "example@example.com",
                        guest_phone: "+4369955556666",
                        status: "PENDING",
                    });
                }).rejects.toThrow();
            });

            test("starting before opening_time", async () => {
                const table = await tablesFactory.create();
                const tomorrow = Temporal.Now.plainDateISO().add({ days: 1 });
                const openingHours = await updateOpeningHours(
                    tomorrow.dayOfWeek % 7,
                    {
                        opening_time: getMinutesFrom00hs(
                            new Temporal.PlainTime(12, 0),
                        ),
                    },
                );
                await expect(async () => {
                    await createBooking({
                        table_id: table.id,
                        booking_date: tomorrow.toString(),
                        booking_start_time: getMinutesFrom00hs(
                            new Temporal.PlainTime(9, 0),
                        ),
                        pax: 3,
                        guest_first_name: "John",
                        guest_last_name: "Doe",
                        guest_email: "example@example.com",
                        guest_phone: "+4369955556666",
                        status: "PENDING",
                    });
                }).rejects.toThrow();
            });

            test("ending after closing_time", async () => {
                const table = await tablesFactory.create();
                const tomorrow = Temporal.Now.plainDateISO().add({ days: 1 });
                const openingHours = await updateOpeningHours(
                    tomorrow.dayOfWeek % 7,
                    {
                        closing_time: getMinutesFrom00hs(
                            new Temporal.PlainTime(12, 0),
                        ),
                    },
                );
                await expect(async () => {
                    await createBooking({
                        table_id: table.id,
                        booking_date: tomorrow.toString(),
                        booking_start_time: getMinutesFrom00hs(
                            new Temporal.PlainTime(11, 0),
                        ),
                        duration_minutes: 120,
                        pax: 3,
                        guest_first_name: "John",
                        guest_last_name: "Doe",
                        guest_email: "example@example.com",
                        guest_phone: "+4369955556666",
                        status: "PENDING",
                    });
                }).rejects.toThrow();
            });

            test("overlapping booking already exists starting before booking_starting_time", async () => {
                const table = await tablesFactory.create();
                const tomorrow = Temporal.Now.plainDateISO().add({ days: 1 });
                const existingBooking = bookingsFactory.create({
                    table_id: table.id,
                    booking_date: tomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(11, 0),
                    ),
                    duration_minutes: 120,
                });
                await expect(async () => {
                    await createBooking({
                        table_id: table.id,
                        booking_date: tomorrow.toString(),
                        booking_start_time: getMinutesFrom00hs(
                            new Temporal.PlainTime(12, 0),
                        ),
                        duration_minutes: 120,
                        pax: 3,
                        guest_first_name: "John",
                        guest_last_name: "Doe",
                        guest_email: "example@example.com",
                        guest_phone: "+4369955556666",
                        status: "PENDING",
                    });
                }).rejects.toThrow();
            });

            test("overlapping booking already exists starting after booking_starting_time", async () => {
                const table = await tablesFactory.create();
                const tomorrow = Temporal.Now.plainDateISO().add({ days: 1 });
                const existingBooking = bookingsFactory.create({
                    table_id: table.id,
                    booking_date: tomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(11, 0),
                    ),
                    duration_minutes: 120,
                });
                await expect(async () => {
                    await createBooking({
                        table_id: table.id,
                        booking_date: tomorrow.toString(),
                        booking_start_time: getMinutesFrom00hs(
                            new Temporal.PlainTime(10, 0),
                        ),
                        duration_minutes: 120,
                        pax: 3,
                        guest_first_name: "John",
                        guest_last_name: "Doe",
                        guest_email: "example@example.com",
                        guest_phone: "+4369955556666",
                        status: "PENDING",
                    });
                }).rejects.toThrow();
            });

            test("with no conflicts", async () => {
                const table = await tablesFactory.create();
                const tomorrow = Temporal.Now.plainDateISO().add({ days: 1 });
                const startTime = getMinutesFrom00hs(
                    new Temporal.PlainTime(10, 0),
                );
                const booking = await createBooking({
                    table_id: table.id,
                    booking_date: tomorrow.toString(),
                    booking_start_time: startTime,
                    duration_minutes: 120,
                    pax: 3,
                    guest_first_name: "John",
                    guest_last_name: "Doe",
                    guest_email: "example@example.com",
                    guest_phone: "+4369955556666",
                    status: "PENDING",
                });
                const now = Temporal.Now.plainDateTimeISO().toString();
                expect(uuidValidate(booking.booking_secret)).toBe(true);
                expect(
                    Temporal.PlainDateTime.compare(
                        now,
                        Temporal.PlainDateTime.from(booking.created_at),
                    ),
                ).toBeGreaterThanOrEqual(0);
                expect(booking).toStrictEqual({
                    id: booking.id,
                    table_id: table.id,
                    booking_date: tomorrow.toString(),
                    booking_start_time: startTime,
                    duration_minutes: 120,
                    pax: 3,
                    guest_first_name: "John",
                    guest_last_name: "Doe",
                    guest_email: "example@example.com",
                    guest_phone: "+4369955556666",
                    status: "PENDING",
                    special_requests: null,
                    created_at: booking.created_at,
                    booking_secret: booking.booking_secret,
                });
            });
        });

        describe("update", () => {
            test("unexistent booking", async () => {
                await expect(async () => {
                    await updateBooking(10000, { duration_minutes: 60 });
                }).rejects.toThrow();
            });

            test("to unexistent table_id", async () => {
                const booking = await bookingsFactory.create();
                await expect(async () => {
                    await updateBooking(booking.id, {
                        table_id: 1000,
                    });
                }).rejects.toThrow();
            });

            test("to disabled table", async () => {
                const tables = await tablesFactory.createMany(2);
                const disabledTable = await updateTable(tables[1]!.id, {
                    disabled: true,
                });
                const booking = await bookingsFactory.create({
                    table_id: tables[0]!.id,
                });
                await expect(async () => {
                    await updateBooking(booking.id, {
                        table_id: disabledTable.id,
                    });
                }).rejects.toThrow();
            });

            test("with table capacity below pax", async () => {
                const tables = await tablesFactory.createMany(2);
                const tableBelowCapacity = await updateTable(tables[1]!.id, {
                    capacity: 2,
                });
                const booking = await bookingsFactory.create({
                    table_id: tables[0]!.id,
                    pax: 3,
                });
                await expect(async () => {
                    await updateBooking(booking.id, {
                        table_id: tableBelowCapacity.id,
                    });
                }).rejects.toThrow();
            });

            test("with table deleted", async () => {
                const tables = await tablesFactory.createMany(2);
                const result = await deleteTable(tables[0]!.id);
                expect(result).toBe(true);
                const booking = await bookingsFactory.create({
                    table_id: tables[1]!.id,
                });
                await expect(async () => {
                    await updateBooking(booking.id, {
                        table_id: tables[0]!.id,
                    });
                }).rejects.toThrow();
            });

            test("on a closed day", async () => {
                const table = await tablesFactory.create();
                const today = Temporal.Now.plainDateTimeISO();
                const booking = await bookingsFactory.create({
                    table_id: table.id,
                    booking_date: today.toString(),
                });
                const tomorrow = today.add({
                    days: 1,
                });
                const openingHours = await updateOpeningHours(
                    tomorrow.dayOfWeek % 7,
                    { is_closed: true },
                );
                await expect(async () => {
                    await updateBooking(booking.id, {
                        booking_date: tomorrow.toString(),
                    });
                }).rejects.toThrow();
            });

            test("starting before opening_time", async () => {
                const table = await tablesFactory.create();
                const tomorrow = Temporal.Now.plainDateISO().add({
                    days: 1,
                });
                const openingHours = await updateOpeningHours(
                    tomorrow.dayOfWeek % 7,
                    {
                        opening_time: getMinutesFrom00hs(
                            new Temporal.PlainTime(12, 0),
                        ),
                    },
                );
                const booking = await bookingsFactory.create({
                    table_id: table.id,
                    booking_date: tomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(13, 0),
                    ),
                });

                await expect(async () => {
                    await updateBooking(booking.id, {
                        booking_start_time: getMinutesFrom00hs(
                            new Temporal.PlainTime(9, 0),
                        ),
                    });
                }).rejects.toThrow();
            });

            test("ending after closing_time", async () => {
                const table = await tablesFactory.create();
                const tomorrow = Temporal.Now.plainDateISO().add({
                    days: 1,
                });
                const openingHours = await updateOpeningHours(
                    tomorrow.dayOfWeek % 7,
                    {
                        closing_time: getMinutesFrom00hs(
                            new Temporal.PlainTime(12, 0),
                        ),
                    },
                );
                const booking = await bookingsFactory.create({
                    table_id: table.id,
                    booking_date: tomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(9, 0),
                    ),
                });

                await expect(async () => {
                    await updateBooking(booking.id, {
                        booking_start_time: getMinutesFrom00hs(
                            new Temporal.PlainTime(11, 0),
                        ),
                        duration_minutes: 120,
                    });
                }).rejects.toThrow();
            });

            test("overlapping booking already exists starting before booking_starting_time", async () => {
                const table = await tablesFactory.create();
                const today = Temporal.Now.plainDateISO();
                const tomorrow = today.add({
                    days: 1,
                });
                const booking = await bookingsFactory.create({
                    table_id: table.id,
                    booking_date: today.toString(),
                });
                const existingBooking = await bookingsFactory.create({
                    table_id: table.id,
                    booking_date: tomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(11, 0),
                    ),
                    duration_minutes: 120,
                });
                await expect(async () => {
                    await updateBooking(booking.id, {
                        booking_date: tomorrow.toString(),
                        booking_start_time: getMinutesFrom00hs(
                            new Temporal.PlainTime(12, 0),
                        ),
                        duration_minutes: 120,
                    });
                }).rejects.toThrow();
            });

            test("overlapping booking already exists starting after booking_starting_time", async () => {
                const table = await tablesFactory.create();
                const today = Temporal.Now.plainDateISO();
                const tomorrow = today.add({
                    days: 1,
                });
                const booking = await bookingsFactory.create({
                    table_id: table.id,
                    booking_date: today.toString(),
                });
                const existingBooking = bookingsFactory.create({
                    table_id: table.id,
                    booking_date: tomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(11, 0),
                    ),
                    duration_minutes: 120,
                });
                await expect(async () => {
                    await updateBooking(booking.id, {
                        booking_date: tomorrow.toString(),
                        booking_start_time: getMinutesFrom00hs(
                            new Temporal.PlainTime(10, 0),
                        ),
                        duration_minutes: 120,
                    });
                }).rejects.toThrow();
            });

            test("with no conflicts", async () => {
                const table = await tablesFactory.create();
                const tomorrow = Temporal.Now.plainDateISO().add({
                    days: 1,
                });
                const startTime = getMinutesFrom00hs(
                    new Temporal.PlainTime(10, 0),
                );
                const booking = await bookingsFactory.create({
                    table_id: table.id,
                    booking_date: tomorrow.toString(),
                    booking_start_time: startTime,
                    duration_minutes: 120,
                    pax: 3,
                    guest_first_name: "John",
                    guest_last_name: "Doe",
                    guest_email: "example@example.com",
                    guest_phone: "+4369955556666",
                    status: "PENDING",
                });
                const updatedBooking = await updateBooking(booking.id, {
                    table_id: table.id,
                    booking_date: tomorrow.toString(),
                    booking_start_time: startTime,
                    duration_minutes: 124,
                    pax: 3,
                    guest_first_name: "John",
                    guest_last_name: "Doe",
                    guest_email: "example@example.com",
                    guest_phone: "+4369955556666",
                    status: "PENDING",
                });
                const now = Temporal.Now.plainDateTimeISO().toString();
                expect(uuidValidate(booking.booking_secret)).toBe(true);
                expect(
                    Temporal.PlainDateTime.compare(
                        now,
                        Temporal.PlainDateTime.from(booking.created_at),
                    ),
                ).toBeGreaterThanOrEqual(0);
                expect(updatedBooking).toStrictEqual({
                    id: booking.id,
                    table_id: table.id,
                    booking_date: tomorrow.toString(),
                    booking_start_time: startTime,
                    duration_minutes: 124,
                    pax: 3,
                    guest_first_name: "John",
                    guest_last_name: "Doe",
                    guest_email: "example@example.com",
                    guest_phone: "+4369955556666",
                    status: "PENDING",
                    special_requests: null,
                    created_at: booking.created_at,
                    booking_secret: booking.booking_secret,
                });
            });

            test("with no hard requirements", async () => {
                const booking = await bookingsFactory.create();
                const updatedBooking = await updateBooking(booking.id, {
                    guest_first_name: "Diana",
                    guest_last_name: "Example",
                    guest_email: "example@example.com",
                    guest_phone: "+4369955556666",
                    status: "PENDING",
                });
                const now = Temporal.Now.plainDateTimeISO().toString();
                expect(uuidValidate(booking.booking_secret)).toBe(true);
                expect(
                    Temporal.PlainDateTime.compare(
                        now,
                        Temporal.PlainDateTime.from(booking.created_at),
                    ),
                ).toBeGreaterThanOrEqual(0);
                expect(updatedBooking).toStrictEqual({
                    id: booking.id,
                    table_id: booking.id,
                    booking_date: booking.booking_date,
                    booking_start_time: booking.booking_start_time,
                    duration_minutes: booking.duration_minutes,
                    pax: booking.pax,
                    guest_first_name: "Diana",
                    guest_last_name: "Example",
                    guest_email: "example@example.com",
                    guest_phone: "+4369955556666",
                    status: "PENDING",
                    special_requests: null,
                    created_at: booking.created_at,
                    booking_secret: booking.booking_secret,
                });
            });
        });
    });
});
