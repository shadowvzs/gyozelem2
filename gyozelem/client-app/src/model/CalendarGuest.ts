import { BaseEntity, IBaseEntity } from "./BaseEntity";
import Guest from "./Guest";

export interface ICalendarGuest extends IBaseEntity<ICalendarGuest> {
    calendarEventId: string;
    guestId: string;
    guest?: Guest;
}

export class CalendarGuest extends BaseEntity<CalendarGuest> implements ICalendarGuest {

    public calendarEventId: string;

    public guestId: string;

    public get guest() {
        return new Guest();
    };
    
    public set guest(guest: Guest) {
        this.guestId = guest.id;
    }
}

export default CalendarGuest;
