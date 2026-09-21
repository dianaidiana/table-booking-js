export const sharedMessages = {
    updateTargetNotFound: (resourceName: string, id: unknown) =>
        `Failed to update ${resourceName} with id ${id}: not found`,
};

export const tableMessages = {
    notFound: (id: number) => `Table with id ${id} not found`,
    hasBookings: (id: number) =>
        `Failed to update table ${id}: it has associated bookings`,
};

export const tableGroupMessages = {
    notFound: (id: number) => `Table group with id ${id} not found`,
    hasTables: (id: number) =>
        `Failed to delete table group ${id}: it has associated tables`,
};

export const bookingMessages = {
    notFound: (id: number) => `Booking with id ${id} not found`,
    tableNotAvailable: () =>
        `The requested table is not available for this date and time`,
};

export const openingHoursMessages = {
    notFound: (weekday: number) =>
        `Opening hours for weekday ${weekday} not found`,
    conflictingBookings: () =>
        `Cannot update opening hours: existing bookings conflict with the new hours`,
};

export const customerBookingMessages = {
    notFoundBySecret: (bookingSecret: string) =>
        `Booking with secret ${bookingSecret} not found`,
    alreadyCancelled: () =>
        `Cannot confirm booking: it has already been cancelled`,
    noAvailableTable: () =>
        `No available table found for the requested date, time and party size`,
};
