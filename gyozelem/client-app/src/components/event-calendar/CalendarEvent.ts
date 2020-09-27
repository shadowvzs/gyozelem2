import { ICalendar } from "./types";

export class CalendarEvent implements ICalendar.Event {
    public id: number;
    public user_id?: number;
    public title: string;
    public message: string;
    public createdAt?: string;
    public updatedAt?: string;
}

export default CalendarEvent;