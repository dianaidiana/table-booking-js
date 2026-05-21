export function getMinutesFrom00hs(date: Date) {
    return date.getHours() * 60 + date.getMinutes();
}
