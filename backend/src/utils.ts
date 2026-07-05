export function getMinutesFrom00hs(time: Temporal.PlainTime) {
    return time.hour * 60 + time.minute;
}

export function getTimeFromMinutes(totalMinutes: number): Temporal.PlainTime {
    const midnight = new Temporal.PlainTime(0, 0);
    return midnight.add({ minutes: totalMinutes });
}
