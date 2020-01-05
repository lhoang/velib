import dayjs from "dayjs";

export function getMonthStr(date) {
    const day = dayjs(date);
    return [day.format('MMM'),day.format('YYYY')];
}

export function getDay(date) {
    return dayjs(date).format('YYYY-MM-DD');
}
export function getTime(date) {
    return dayjs(date).format('HH:mm');
}