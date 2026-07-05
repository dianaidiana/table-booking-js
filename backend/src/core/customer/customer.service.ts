import { getTimeFromMinutes } from "../../utils.ts";
import type { CreateBooking } from "../bookings/bookings.dba.ts";
import { createBooking } from "../bookings/bookings.service.ts";
import { dbGetOpeningHoursByDay } from "../opening-hours/opening-hours.dba.ts";
import { dbGetSettings } from "../settings/settings.dba.ts";
import {
    dbGetTableBookingRows,
    type AvailableSlots,
    type BookedSlot,
    type GroupMap,
} from "./customer.dba.ts";

// completeRegistration(

// 	await createBooking(..);

// 	await sendEmail();

// )

// confirmRegistration(booking_secret)

// cancelRegistration(booking_secret);

// await fetch("sendemail.com/send", { method: "POST", body: "email" });

export function getGroupMap(date: Temporal.PlainDate, pax: number): GroupMap {
    const tableBookingRows = dbGetTableBookingRows(date, pax);
    const groupMap: GroupMap = {};

    for (const row of tableBookingRows) {
        const tableId = row.table_id;
        const groupName = row.table_group_name;

        if (!groupMap[groupName]) {
            groupMap[groupName] = {};
        }

        if (!groupMap[groupName][tableId]) {
            groupMap[groupName][tableId] = [];
        }

        if (row.start_time !== null && row.end_time !== null) {
            groupMap[groupName][tableId].push({
                start: row.start_time,
                end: row.end_time,
            });
        }
    }

    return groupMap;
}

export function getAvailableSlots(
    date: Temporal.PlainDate,
    pax: number,
): AvailableSlots[] {
    const openingHours = dbGetOpeningHoursByDay(date.dayOfWeek % 7);
    const { booking_duration } = dbGetSettings();
    if (!openingHours || openingHours.is_closed) {
        return [];
    }

    const groupMap = getGroupMap(date, pax);

    const result = [];
    const interval = 15;

    for (const groupName in groupMap) {
        const tableMap = groupMap[groupName];
        if (!tableMap) {
            continue;
        }

        const availableStartTimes = [];
        for (
            let slotStart = openingHours.opening_time;
            slotStart <= openingHours.closing_time - booking_duration;
            slotStart += interval
        ) {
            const slotEnd = slotStart + booking_duration;

            let isAnyTableFree = false;
            for (const bookedSlots of Object.values(tableMap)) {
                if (isTableFree(bookedSlots, slotStart, slotEnd)) {
                    isAnyTableFree = true;
                    break;
                }
            }

            if (isAnyTableFree) {
                availableStartTimes.push(slotStart);
            }
        }

        result.push({
            tableGroup: groupName,
            availableStartTimes: availableStartTimes,
        });
    }

    return result;
}

function isTableFree(
    bookedSlots: BookedSlot[],
    slotStart: number,
    slotEnd: number,
): boolean {
    for (const bookedSlot of bookedSlots) {
        if (slotStart < bookedSlot.end && slotEnd > bookedSlot.start) {
            return false;
        }
    }

    return true;
}

export function assignTableId(
    date: Temporal.PlainDate,
    pax: number,
    slotStart: number,
    groupName: string,
): number | null {
    const { booking_duration } = dbGetSettings();
    const slotEnd = slotStart + booking_duration;

    const groupMap = getGroupMap(date, pax);
    const tableMap = groupMap[groupName];

    if (!tableMap) return null;

    for (const tableId in tableMap) {
        const bookedSlots = tableMap[Number(tableId)];
        if (!bookedSlots) {
            return null;
        }

        if (isTableFree(bookedSlots, slotStart, slotEnd)) {
            return Number(tableId);
        }
    }

    return null;
}

// export function requestBooking(bookingRequest: CreateBooking): boolean {
//     const booking = createBooking(bookingRequest);
//     console.log(
//         `Fake email:
//         Hi ${booking.guest_first_name},
//         Thank you for booking with us!
//         Please review your reservation details and click on the buttons below to confirm or cancel your reservation:
//         Date: ${booking.booking_date}
//         Time: ${getTimeFromMinutes(booking.booking_start_time).toString()}
//         Attendees: ${booking.pax}
//         [CONFIRM] [CANCEL]
//         `,
//     );
//     return true;
// }
