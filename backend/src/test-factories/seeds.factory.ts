import { randomUUID } from "node:crypto";
import {
    dbCreateBooking,
    type CreateBooking,
} from "../core/bookings/bookings.dba.ts";
import { dbCreateTableGroup } from "../core/table-groups/table-groups.dba.ts";
import { dbCreateTable } from "../core/tables/tables.dba.ts";

async function createDefaultTableGroup() {
    return dbCreateTableGroup({ name: "table group" });
}

async function createManyDefaultTableGroups(numberOfTableGroups: number) {
    const tableGroups = [];
    for (let i = 0; i < numberOfTableGroups; i++) {
        const tableGroup = await dbCreateTableGroup({
            name: "table group " + i,
        });
        tableGroups.push(tableGroup);
    }
    return tableGroups;
}

async function createDefaultTableGroupWithTable() {
    const createTableGroup = { name: "Table Group" };
    const tableGroup = await dbCreateTableGroup(createTableGroup);

    const createTable = {
        table_group_id: tableGroup.id,
        table_number: "1",
        capacity: 4,
        disabled: false,
    };
    const table = await dbCreateTable(createTable);
    return { tableGroup, table };
}

async function createDefaultTableGroupWithManyTables(numberOfTables: number) {
    const createTableGroup = { name: "Table Group 1" };
    const tableGroup = await dbCreateTableGroup(createTableGroup);

    const tables = [];
    for (let i = 0; i < numberOfTables; i++) {
        const createTable = {
            table_group_id: tableGroup.id,
            table_number: "" + i,
            capacity: 4,
            disabled: false,
        };
        const table = await dbCreateTable(createTable);
        tables.push(table);
    }

    return { tableGroup, tables };
}

async function createBooking(createBooking: CreateBooking) {
    const bookingSecret = randomUUID();
    return await dbCreateBooking(createBooking, bookingSecret);
}

async function createDefaultTableWithBooking() {
    const { tableGroup, table } = await createDefaultTableGroupWithTable();
    const bookingSecret = randomUUID();
    const booking = await dbCreateBooking(
        {
            table_id: table.id,
            booking_date: new Date().toISOString(),
            booking_start_time: 100,
            pax: 3,
            guest_first_name: "firstname",
            guest_last_name: "lastname",
            guest_email: "example@gmail.com",
            guest_phone: "+4369911111111",
            status: "CONFIRMED",
        },
        bookingSecret,
    );

    return { tableGroup, table, booking };
}

export const factory = {
    createDefaultTableGroup,
    createManyDefaultTableGroups,
    createDefaultTableGroupWithTable,
    createDefaultTableGroupWithManyTables,
    createBooking,
    createDefaultTableWithBooking,
};
