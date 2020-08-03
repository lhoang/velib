import dayjs from 'dayjs';

export function formatDDMM(date) {
    return dayjs(date).format('DD/MM');
}

export function getMonthStr(date) {
    const day = dayjs(date);
    return [day.format('MMM'),day.format('YYYY')];
}

export function getDay(date) {
    return dayjs(date).format('YYYY-MM-DD');
}

export function parseDay(str) {
    return dayjs(str);
}
export function getTime(date) {
    return dayjs(date).format('HH:mm');
}
export function formatDuration(duration) {
    const min =  Math.floor(duration / 60);
    const sec = duration % 60;
    return min ? `${min}min ${sec}s` : `${sec}s`;
}

export function addDay(day, n) {
   return dayjs(day).add(n, 'day');
}