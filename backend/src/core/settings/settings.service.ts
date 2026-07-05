import {
    dbGetSettings,
    dbUpdateSettings,
    type PartialSettings,
    type Settings,
} from "./settings.dba.ts";

export function getSettings(): Settings {
    return dbGetSettings();
}

export function updateSettings({
    booking_duration,
}: PartialSettings): Settings {
    return dbUpdateSettings({ booking_duration });
}
