import {
    dbGetSettings,
    dbUpdateSettings,
    type PartialSettings,
    type Settings,
} from "./settings.dba.js";

export async function getSettings(): Promise<Settings> {
    return await dbGetSettings();
}

export async function updateSettings({
    booking_duration,
}: PartialSettings): Promise<Settings> {
    return await dbUpdateSettings({ booking_duration });
}
