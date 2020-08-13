import dayjs, {Dayjs} from 'dayjs';

export function formatDDMM(date): string {
    return dayjs(date).format('DD/MM');
}

export function getMonthStr(date): [string, string] {
    const day = dayjs(date);
    return [day.format('MMM'),day.format('YYYY')];
}

export function getDay(date): string {
    return dayjs(date).format('YYYY-MM-DD');
}

export function parseDay(str): Dayjs {
    return dayjs(str);
}
export function getTime(date): string {
    return dayjs(date).format('HH:mm');
}
export function formatDuration(duration): string {
    const min =  Math.floor(duration / 60);
    const sec = duration % 60;
    return min ? `${min}min ${sec}s` : `${sec}s`;
}

export function addDay(day, n): Dayjs {
   return dayjs(day).add(n, 'day');
}