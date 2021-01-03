import { DateEx } from "../model/DateEx";

interface DateModifier {
    year?: number;
    month?: number;
    day?: number;
}

interface DateInfo {
    year: number;
    month: number;
    day: number;
    hour: number;
    min: number;
    sec: number;
}

interface DateMap extends DateInfo {
    currentDay: number;
    firstDay: number;
    prevMonthLastDay: number;
    monthLastDay: number;
    lastDay: number;
}

export const betweenDate = (dates: (string | DateEx)[]): DateEx => {
    const [ date, min, max ] = dates.map(d => toDate(d));
    if (+date < +min) return min;
    if (+date > +max) return max;
    return date;
}

export const toDate = (input?: string | DateEx): DateEx => (input ? (typeof input === 'string' ? new DateEx(input) : input) : new DateEx()) as DateEx;

export const date2MysqlDate = (input: string | DateEx): string => {
    const date = toDate(input);
    return `${date.getFullYear()}-${(""+(date.getMonth() + 1)).padStart(2, '0')}-${(""+date.getDate()).padStart(2, '0')} ${(""+date.getHours()).padStart(2, '0')}:${(""+date.getMinutes()).padStart(2, '0')}:${(""+date.getSeconds()).padStart(2, '0')}`;
}

export const mysqlDate2Date = (input: string): DateEx => {
    const [date, time] = input.split(' ');
    const [year, month, day] = date.split('-').map(x => parseInt(x));
    const [hour, minute, second] = time.split(':').map(x => parseInt(x));
    const newDate = new DateEx();
    newDate.set({
        year: year,
        month: month,
        day: day,
        hour: hour,
        min: minute,
        sec: second
    });
    return newDate;
}

export const deltaDate = (input: string | DateEx, modifier: DateModifier): DateEx => {
    const date = toDate(input);
    const { year, month, day } = modifier;
    if (day) date.setDate(date.getDate() + day);
    if (month) date.setMonth(date.getMonth() + month);
    if (year) date.setFullYear(date.getFullYear() + year);
    return date;
}

export const setDate = (input: string | DateEx,  day?: number, month?: number, year?: number): DateEx => {
    const date = toDate(input);
    if (day) date.setDate(day);
    if (month) date.setMonth(month - 1);
    if (year) date.setFullYear(year);
    return date;
}

export const setTime = (input: string | DateEx,  hour?: number, min?: number, sec?: number): DateEx => {
    const date = toDate(input);
    if (hour) date.set({ hour });
    if (min) date.set({ min });
    if (sec) date.set({ sec });
    return date;
}

export const getMonthInfo = (input?: string | DateEx): DateMap => {
    const date = toDate(input).clone();
    const dateInfo = date.getObjectForm() as DateMap;
    dateInfo.currentDay = date.getDay();
    dateInfo.firstDay = setDate(date, 1).getDay();
    dateInfo.prevMonthLastDay = deltaDate(date, { day: -1 }).getDate();
    dateInfo.monthLastDay = deltaDate(setDate(date, 1, dateInfo.month + 1), { day: -1 }).getDate();
    dateInfo.lastDay = date.getDay();
    return dateInfo;
}

export const to2digit = (n: number, len = 2): string => {
    return  ("" + n).padStart(len, '0')
}