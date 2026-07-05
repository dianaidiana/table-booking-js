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
            test("by specific date", () => {
                const tables = tablesFactory.createMany(2);
                const booking1 = bookingsFactory.create({
                    table_id: tables[0]!.id,
                    booking_date: Temporal.Now.plainDateISO()
                        .add({ days: 1 })
                        .toString(),
                });
                const booking2 = bookingsFactory.create({
                    table_id: tables[1]!.id,
                    booking_date: Temporal.Now.plainDateISO()
                        .add({ days: 2 })
                        .toString(),
                });
                const result = listBookings({
                    specificDate: Temporal.Now.plainDateISO()
                        .add({ days: 1 })
                        .toString(),
                });
                expect(result).toStrictEqual([booking1]);
            });

            test("by startDate and endDate", () => {
                const tables = tablesFactory.createMany(4);
                const dates = [];
                for (let i = 0; i <= 4; i++) {
                    dates.push(
                        Temporal.Now.plainDateISO().add({ days: i }).toString(),
                    );
                }
                const booking1 = bookingsFactory.create({
                    table_id: tables[0]!.id,
                    booking_date: dates[0]!,
                });
                const booking2 = bookingsFactory.create({
                    table_id: tables[1]!.id,
                    booking_date: dates[1]!,
                });
                const booking3 = bookingsFactory.create({
                    table_id: tables[2]!.id,
                    booking_date: dates[2]!,
                });
                const booking4 = bookingsFactory.create({
                    table_id: tables[3]!.id,
                    booking_date: dates[3]!,
                });
                const result = listBookings({
                    startDate: dates[1],
                    endDate: dates[2],
                });
                expect(result).toStrictEqual([booking2, booking3]);
            });

            test("by startDate", () => {
                const tables = tablesFactory.createMany(4);
                const dates = [];
                for (let i = 0; i <= 4; i++) {
                    dates.push(
                        Temporal.Now.plainDateISO().add({ days: i }).toString(),
                    );
                }
                const booking1 = bookingsFactory.create({
                    table_id: tables[0]!.id,
                    booking_date: dates[0]!,
                });
                const booking2 = bookingsFactory.create({
                    table_id: tables[1]!.id,
                    booking_date: dates[1]!,
                });
                const booking3 = bookingsFactory.create({
                    table_id: tables[2]!.id,
                    booking_date: dates[2]!,
                });
                const booking4 = bookingsFactory.create({
                    table_id: tables[3]!.id,
                    booking_date: dates[3]!,
                });
                const result = listBookings({
                    startDate: dates[1],
                });
                expect(result).toStrictEqual([booking2, booking3, booking4]);
            });

            test("by endDate", () => {
                const tables = tablesFactory.createMany(4);
                const dates = [];
                for (let i = 0; i <= 4; i++) {
                    dates.push(
                        Temporal.Now.plainDateISO().add({ days: i }).toString(),
                    );
                }
                const booking1 = bookingsFactory.create({
                    table_id: tables[0]!.id,
                    booking_date: dates[0]!,
                });
                const booking2 = bookingsFactory.create({
                    table_id: tables[1]!.id,
                    booking_date: dates[1]!,
                });
                const booking3 = bookingsFactory.create({
                    table_id: tables[2]!.id,
                    booking_date: dates[2]!,
                });
                const booking4 = bookingsFactory.create({
                    table_id: tables[3]!.id,
                    booking_date: dates[3]!,
                });
                const result = listBookings({
                    endDate: dates[1],
                });
                expect(result).toStrictEqual([booking1, booking2]);
            });

            test("by weekday", () => {
                const tables = tablesFactory.createMany(4);
                const dates = [];
                for (let i = 0; i <= 4; i++) {
                    dates.push(Temporal.Now.plainDateISO().add({ days: i }));
                }
                const booking1 = bookingsFactory.create({
                    table_id: tables[0]!.id,
                    booking_date: dates[0]!.toString(),
                });
                const booking2 = bookingsFactory.create({
                    table_id: tables[1]!.id,
                    booking_date: dates[1]!.toString(),
                });
                const booking3 = bookingsFactory.create({
                    table_id: tables[2]!.id,
                    booking_date: dates[2]!.toString(),
                });
                const booking4 = bookingsFactory.create({
                    table_id: tables[3]!.id,
                    booking_date: dates[3]!.toString(),
                });
                const result = listBookings({
                    weekday: dates[2]!.dayOfWeek % 7,
                });
                expect(result).toStrictEqual([booking3]);
            });

            test("by startTime with specificDate", () => {
                const tables = tablesFactory.createMany(5);
                const tomorrow = Temporal.Now.plainDateISO().add({ days: 1 });
                const dayAfterTomorrow = tomorrow.add({ days: 1 });
                const booking0 = bookingsFactory.create({
                    table_id: tables[0]!.id,
                    booking_date: tomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(9, 0),
                    ),
                    duration_minutes: 60,
                });
                const booking1 = bookingsFactory.create({
                    table_id: tables[0]!.id,
                    booking_date: tomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(10, 0),
                    ),
                    duration_minutes: 61,
                });
                const booking2 = bookingsFactory.create({
                    table_id: tables[1]!.id,
                    booking_date: tomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(11, 0),
                    ),
                    duration_minutes: 60,
                });
                const booking3 = bookingsFactory.create({
                    table_id: tables[2]!.id,
                    booking_date: tomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(12, 0),
                    ),
                    duration_minutes: 60,
                });
                const booking4 = bookingsFactory.create({
                    table_id: tables[3]!.id,
                    booking_date: dayAfterTomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(14, 0),
                    ),
                });
                const result = listBookings({
                    specificDate: tomorrow.toString(),
                    startTime: getMinutesFrom00hs(
                        new Temporal.PlainTime(11, 0),
                    ),
                });
                expect(result).toStrictEqual([booking1, booking2, booking3]);
            });

            test("by endTime with specificDate", () => {
                const tables = tablesFactory.createMany(5);
                const tomorrow = Temporal.Now.plainDateISO().add({ days: 1 });
                const dayAfterTomorrow = tomorrow.add({ days: 1 });
                const booking0 = bookingsFactory.create({
                    table_id: tables[0]!.id,
                    booking_date: tomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(9, 0),
                    ),
                    duration_minutes: 60,
                });
                const booking1 = bookingsFactory.create({
                    table_id: tables[0]!.id,
                    booking_date: tomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(10, 0),
                    ),
                    duration_minutes: 61,
                });
                const booking2 = bookingsFactory.create({
                    table_id: tables[1]!.id,
                    booking_date: tomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(11, 0),
                    ),
                    duration_minutes: 60,
                });
                const booking3 = bookingsFactory.create({
                    table_id: tables[2]!.id,
                    booking_date: tomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(12, 0),
                    ),
                    duration_minutes: 60,
                });
                const booking4 = bookingsFactory.create({
                    table_id: tables[3]!.id,
                    booking_date: dayAfterTomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(14, 0),
                    ),
                });
                const result = listBookings({
                    specificDate: tomorrow.toString(),
                    endTime: getMinutesFrom00hs(new Temporal.PlainTime(11, 0)),
                });
                expect(result).toStrictEqual([booking0, booking1]);
            });

            test("by startTime with startDate", () => {
                const tables = tablesFactory.createMany(5);
                const tomorrow = Temporal.Now.plainDateISO().add({ days: 1 });
                const dayAfterTomorrow = tomorrow.add({ days: 1 });
                const booking0 = bookingsFactory.create({
                    table_id: tables[0]!.id,
                    booking_date: tomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(9, 0),
                    ),
                    duration_minutes: 60,
                });
                const booking1 = bookingsFactory.create({
                    table_id: tables[0]!.id,
                    booking_date: tomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(10, 0),
                    ),
                    duration_minutes: 61,
                });
                const booking2 = bookingsFactory.create({
                    table_id: tables[1]!.id,
                    booking_date: tomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(11, 0),
                    ),
                    duration_minutes: 60,
                });
                const booking3 = bookingsFactory.create({
                    table_id: tables[2]!.id,
                    booking_date: tomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(12, 0),
                    ),
                    duration_minutes: 60,
                });
                const booking4 = bookingsFactory.create({
                    table_id: tables[3]!.id,
                    booking_date: dayAfterTomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(9, 0),
                    ),
                });
                const result = listBookings({
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

            test("by endTime with endDate", () => {
                const tables = tablesFactory.createMany(5);
                const tomorrow = Temporal.Now.plainDateISO().add({ days: 1 });
                const dayAfterTomorrow = tomorrow.add({ days: 1 });
                const booking0 = bookingsFactory.create({
                    table_id: tables[0]!.id,
                    booking_date: tomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(9, 0),
                    ),
                    duration_minutes: 60,
                });
                const booking1 = bookingsFactory.create({
                    table_id: tables[0]!.id,
                    booking_date: tomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(10, 0),
                    ),
                    duration_minutes: 61,
                });
                const booking2 = bookingsFactory.create({
                    table_id: tables[1]!.id,
                    booking_date: dayAfterTomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(11, 0),
                    ),
                    duration_minutes: 60,
                });
                const booking3 = bookingsFactory.create({
                    table_id: tables[2]!.id,
                    booking_date: dayAfterTomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(12, 0),
                    ),
                    duration_minutes: 60,
                });
                const booking4 = bookingsFactory.create({
                    table_id: tables[3]!.id,
                    booking_date: dayAfterTomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(15, 0),
                    ),
                });
                const result = listBookings({
                    endDate: dayAfterTomorrow.toString(),
                    endTime: getMinutesFrom00hs(new Temporal.PlainTime(12, 0)),
                });
                expect(result).toStrictEqual([booking0, booking1, booking2]);
            });

            test("including cancelled true", () => {
                const tables = tablesFactory.createMany(3);
                const booking0 = bookingsFactory.create({
                    table_id: tables[0]!.id,
                    status: "CANCELLED",
                });
                const booking1 = bookingsFactory.create({
                    table_id: tables[0]!.id,
                });
                const result = listBookings({
                    includeCancelled: true,
                });
                expect(result).toStrictEqual([booking0, booking1]);
            });

            test("including cancelled false", () => {
                const tables = tablesFactory.createMany(2);
                const booking0 = bookingsFactory.create({
                    table_id: tables[0]!.id,
                    status: "CANCELLED",
                });
                const booking1 = bookingsFactory.create({
                    table_id: tables[1]!.id,
                });
                const result = listBookings({
                    includeCancelled: false,
                });
                expect(result).toStrictEqual([booking1]);
            });

            test("by tableId", () => {
                const tables = tablesFactory.createMany(2);
                const booking0 = bookingsFactory.create({
                    table_id: tables[0]!.id,
                });
                const booking1 = bookingsFactory.create({
                    table_id: tables[1]!.id,
                });
                const result = listBookings({
                    tableId: tables[0]!.id,
                });
                expect(result).toStrictEqual([booking0]);
            });

            test("by nonexistent tableId", () => {
                const tables = tablesFactory.createMany(2);
                const booking0 = bookingsFactory.create({
                    table_id: tables[0]!.id,
                });
                const booking1 = bookingsFactory.create({
                    table_id: tables[1]!.id,
                });
                const result = listBookings({
                    tableId: 100,
                });
                expect(result).toStrictEqual([]);
            });

            test("by guestEmail", () => {
                const tables = tablesFactory.createMany(2);
                const booking0 = bookingsFactory.create({
                    table_id: tables[0]!.id,
                    guest_email: "ex@example.com",
                });
                const booking1 = bookingsFactory.create({
                    table_id: tables[1]!.id,
                });
                const result = listBookings({
                    guestEmail: "ex@example.com",
                });
                expect(result).toStrictEqual([booking0]);
            });

            test("by nonexistent guestEmail", () => {
                const tables = tablesFactory.createMany(2);
                const booking0 = bookingsFactory.create({
                    table_id: tables[0]!.id,
                });
                const booking1 = bookingsFactory.create({
                    table_id: tables[1]!.id,
                });
                const result = listBookings({
                    guestEmail: "ex@example.com",
                });
                expect(result).toStrictEqual([]);
            });

            test("excluding id", () => {
                const tables = tablesFactory.createMany(2);
                const booking0 = bookingsFactory.create({
                    table_id: tables[0]!.id,
                });
                const booking1 = bookingsFactory.create({
                    table_id: tables[1]!.id,
                });
                const result = listBookings({
                    exclude: booking1.id,
                });
                expect(result).toStrictEqual([booking0]);
            });
        });

        test("list all without filters", () => {
            const tables = tablesFactory.createMany(2);
            const booking1 = bookingsFactory.create({
                table_id: tables[0]!.id,
            });
            const booking2 = bookingsFactory.create({
                table_id: tables[1]!.id,
            });
            const result = listBookings({});
            expect(result).toStrictEqual([booking1, booking2]);
        });

        test("get by id", () => {
            const booking = bookingsFactory.create();
            const result = getBooking(booking.id);
            expect(result).toStrictEqual(booking);
        });

        test("get by unexistant id", () => {
            const undefinedBooking = getBooking(1000);
            expect(undefinedBooking).toBeUndefined();
        });

        describe("create", () => {
            test("with unexistent table_id", () => {
                expect(() => {
                    createBooking({
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
                }).toThrow();
            });

            test("with disabled table", () => {
                const table = tablesFactory.create({
                    disabled: true,
                    capacity: 5,
                });
                expect(() => {
                    createBooking({
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
                }).toThrow();
            });

            test("with table capacity below pax", () => {
                const table = tablesFactory.create({
                    capacity: 2,
                });
                expect(() => {
                    createBooking({
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
                }).toThrow();
            });

            test("with table deleted", () => {
                const table = tablesFactory.create();
                const result = deleteTable(table.id);
                expect(result).toBe(true);
                expect(() => {
                    createBooking({
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
                }).toThrow();
            });

            test("on a closed day", () => {
                const table = tablesFactory.create();
                const tomorrow = Temporal.Now.plainDateISO().add({ days: 1 });
                const openingHours = updateOpeningHours(
                    tomorrow.dayOfWeek % 7,
                    { is_closed: true },
                );
                expect(() => {
                    createBooking({
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
                }).toThrow();
            });

            test("starting before opening_time", () => {
                const table = tablesFactory.create();
                const tomorrow = Temporal.Now.plainDateISO().add({ days: 1 });
                const openingHours = updateOpeningHours(
                    tomorrow.dayOfWeek % 7,
                    {
                        opening_time: getMinutesFrom00hs(
                            new Temporal.PlainTime(12, 0),
                        ),
                    },
                );
                expect(() => {
                    createBooking({
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
                }).toThrow();
            });

            test("ending after closing_time", () => {
                const table = tablesFactory.create();
                const tomorrow = Temporal.Now.plainDateISO().add({ days: 1 });
                const openingHours = updateOpeningHours(
                    tomorrow.dayOfWeek % 7,
                    {
                        closing_time: getMinutesFrom00hs(
                            new Temporal.PlainTime(12, 0),
                        ),
                    },
                );
                expect(() => {
                    createBooking({
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
                }).toThrow();
            });

            test("overlapping booking already exists starting before booking_starting_time", () => {
                const table = tablesFactory.create();
                const tomorrow = Temporal.Now.plainDateISO().add({ days: 1 });
                const existingBooking = bookingsFactory.create({
                    table_id: table.id,
                    booking_date: tomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(11, 0),
                    ),
                    duration_minutes: 120,
                });
                expect(() => {
                    createBooking({
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
                }).toThrow();
            });

            test("overlapping booking already exists starting after booking_starting_time", () => {
                const table = tablesFactory.create();
                const tomorrow = Temporal.Now.plainDateISO().add({ days: 1 });
                const existingBooking = bookingsFactory.create({
                    table_id: table.id,
                    booking_date: tomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(11, 0),
                    ),
                    duration_minutes: 120,
                });
                expect(() => {
                    createBooking({
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
                }).toThrow();
            });

            test("with no conflicts", () => {
                const table = tablesFactory.create();
                const tomorrow = Temporal.Now.plainDateISO().add({ days: 1 });
                const startTime = getMinutesFrom00hs(
                    new Temporal.PlainTime(10, 0),
                );
                const booking = createBooking({
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
            test("unexistent booking", () => {
                expect(() => {
                    updateBooking(10000, { duration_minutes: 60 });
                }).toThrow();
            });

            test("to unexistent table_id", () => {
                const booking = bookingsFactory.create();
                expect(() => {
                    updateBooking(booking.id, {
                        table_id: 1000,
                    });
                }).toThrow();
            });

            test("to disabled table", () => {
                const tables = tablesFactory.createMany(2);
                const disabledTable = updateTable(tables[1]!.id, {
                    disabled: true,
                });
                const booking = bookingsFactory.create({
                    table_id: tables[0]!.id,
                });
                expect(() => {
                    updateBooking(booking.id, {
                        table_id: disabledTable.id,
                    });
                }).toThrow();
            });

            test("with table capacity below pax", () => {
                const tables = tablesFactory.createMany(2);
                const tableBelowCapacity = updateTable(tables[1]!.id, {
                    capacity: 2,
                });
                const booking = bookingsFactory.create({
                    table_id: tables[0]!.id,
                    pax: 3,
                });
                expect(() => {
                    updateBooking(booking.id, {
                        table_id: tableBelowCapacity.id,
                    });
                }).toThrow();
            });

            test("with table deleted", () => {
                const tables = tablesFactory.createMany(2);
                const result = deleteTable(tables[0]!.id);
                expect(result).toBe(true);
                const booking = bookingsFactory.create({
                    table_id: tables[1]!.id,
                });
                expect(() => {
                    updateBooking(booking.id, {
                        table_id: tables[0]!.id,
                    });
                }).toThrow();
            });

            test("on a closed day", () => {
                const table = tablesFactory.create();
                const today = Temporal.Now.plainDateTimeISO();
                const booking = bookingsFactory.create({
                    table_id: table.id,
                    booking_date: today.toString(),
                });
                const tomorrow = today.add({
                    days: 1,
                });
                const openingHours = updateOpeningHours(
                    tomorrow.dayOfWeek % 7,
                    { is_closed: true },
                );
                expect(() => {
                    updateBooking(booking.id, {
                        booking_date: tomorrow.toString(),
                    });
                }).toThrow();
            });

            test("starting before opening_time", () => {
                const table = tablesFactory.create();
                const tomorrow = Temporal.Now.plainDateISO().add({
                    days: 1,
                });
                const openingHours = updateOpeningHours(
                    tomorrow.dayOfWeek % 7,
                    {
                        opening_time: getMinutesFrom00hs(
                            new Temporal.PlainTime(12, 0),
                        ),
                    },
                );
                const booking = bookingsFactory.create({
                    table_id: table.id,
                    booking_date: tomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(13, 0),
                    ),
                });

                expect(() => {
                    updateBooking(booking.id, {
                        booking_start_time: getMinutesFrom00hs(
                            new Temporal.PlainTime(9, 0),
                        ),
                    });
                }).toThrow();
            });

            test("ending after closing_time", () => {
                const table = tablesFactory.create();
                const tomorrow = Temporal.Now.plainDateISO().add({
                    days: 1,
                });
                const openingHours = updateOpeningHours(
                    tomorrow.dayOfWeek % 7,
                    {
                        closing_time: getMinutesFrom00hs(
                            new Temporal.PlainTime(12, 0),
                        ),
                    },
                );
                const booking = bookingsFactory.create({
                    table_id: table.id,
                    booking_date: tomorrow.toString(),
                    booking_start_time: getMinutesFrom00hs(
                        new Temporal.PlainTime(9, 0),
                    ),
                });

                expect(() => {
                    updateBooking(booking.id, {
                        booking_start_time: getMinutesFrom00hs(
                            new Temporal.PlainTime(11, 0),
                        ),
                        duration_minutes: 120,
                    });
                }).toThrow();
            });

            test("overlapping booking already exists starting before booking_starting_time", () => {
                const table = tablesFactory.create();
                const today = Temporal.Now.plainDateISO();
                const tomorrow = today.add({
                    days: 1,
                });
                const booking = bookingsFactory.create({
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
                expect(() => {
                    updateBooking(booking.id, {
                        booking_date: tomorrow.toString(),
                        booking_start_time: getMinutesFrom00hs(
                            new Temporal.PlainTime(12, 0),
                        ),
                        duration_minutes: 120,
                    });
                }).toThrow();
            });

            test("overlapping booking already exists starting after booking_starting_time", () => {
                const table = tablesFactory.create();
                const today = Temporal.Now.plainDateISO();
                const tomorrow = today.add({
                    days: 1,
                });
                const booking = bookingsFactory.create({
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
                expect(() => {
                    updateBooking(booking.id, {
                        booking_date: tomorrow.toString(),
                        booking_start_time: getMinutesFrom00hs(
                            new Temporal.PlainTime(10, 0),
                        ),
                        duration_minutes: 120,
                    });
                }).toThrow();
            });

            test("with no conflicts", () => {
                const table = tablesFactory.create();
                const tomorrow = Temporal.Now.plainDateISO().add({
                    days: 1,
                });
                const startTime = getMinutesFrom00hs(
                    new Temporal.PlainTime(10, 0),
                );
                const booking = bookingsFactory.create({
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
                const updatedBooking = updateBooking(booking.id, {
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

            test("with no hard requirements", () => {
                const booking = bookingsFactory.create();
                const updatedBooking = updateBooking(booking.id, {
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
