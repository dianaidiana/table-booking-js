import {
    dbGetOpeningHoursPerDay,
    dbListOpeningHours,
    dbUpdateOpeningHours,
    type OpeningHours,
    type UpdateOpeningHours,
} from "./opening-hours.dba.ts";

export async function listOpeningHours(): Promise<OpeningHours[]> {
    return await dbListOpeningHours();
}

export async function getOpeningHoursPerDay(
    weekday: number,
): Promise<OpeningHours | undefined> {
    return await dbGetOpeningHoursPerDay(weekday);
}

export async function updateOpeningHours(
    weekday: number,
    updateOpeningHours: UpdateOpeningHours,
): Promise<OpeningHours> {
    // # get upcoming bookings
    // upcoming_bookings = get_upcoming_bookings_by_weekday(weekday)

    // if opening_time:
    //     # Check if conflicting bookings exist with the new opening time
    //     conflicting_bookings = [booking for booking in upcoming_bookings if booking['booking_start_time'] < opening_time]
    //     if conflicting_bookings:
    //         return jsonify({"error": "Cannot update opening time due to existing upcoming bookings that start before the new opening time"}), 400
    //     updates.append("opening_time = ?")
    //     params.append(opening_time)

    // if closing_time:
    //     # Check if conflicting bookings exist with the new closing time
    //     conflicting_bookings = [booking for booking in upcoming_bookings if booking['booking_end_time'] > closing_time]
    //     if conflicting_bookings:
    //         return jsonify({"error": "Cannot update closing time due to existing upcoming bookings that end after the new closing time"}), 400
    //     updates.append("closing_time = ?")
    //     params.append(closing_time)

    // if is_closed is not None:
    //     # Check if conflicting bookings exist with the new closed status
    //     if upcoming_bookings and is_closed:
    //         return jsonify({"error": "Cannot close restaurant due to existing upcoming bookings on that day"}), 400
    //     updates.append("is_closed = ?")
    //     params.append(is_closed)
    return await dbUpdateOpeningHours(weekday, updateOpeningHours);
}
