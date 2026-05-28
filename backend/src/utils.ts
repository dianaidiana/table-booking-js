export function getMinutesFrom00hs(time: Temporal.PlainTime) {
    return time.hour * 60 + time.minute;
}
