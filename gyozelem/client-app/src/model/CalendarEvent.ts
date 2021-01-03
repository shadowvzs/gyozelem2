import { BaseEntity, IBaseEntity } from "./BaseEntity";
import { CV } from "../util/validator";
import { Type } from "../util/classTransform";
import CalendarGuest from "./CalendarGuest";
import { DateEx } from "./DateEx";

export interface ICalendarEvent extends IBaseEntity<ICalendarEvent> {
    startAt: DateEx;
    endAt?: DateEx;
    visibilityLevel: number;
    title: string;
    message: string;
    calendarGuests?: CalendarGuest[];
}

export class CalendarEvent extends BaseEntity<CalendarEvent> implements ICalendarEvent {

    public static _name = 'CalendarEvent';

    @Type(() => DateEx)
    public startAt: DateEx = new DateEx();

    @Type(() => DateEx)
    public endAt?: DateEx;

    public visibilityLevel: number;

    @CV('REQUIRED', 'Kell egy cim')
    public title: string;

    @CV('REQUIRED', 'Kell egy szoveg')
    public message: string;
    
    @Type(() => CalendarGuest)
    public calendarGuests?: CalendarGuest[] = [];

}

export default CalendarEvent;
