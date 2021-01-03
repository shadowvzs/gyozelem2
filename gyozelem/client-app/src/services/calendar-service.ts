import CalendarEvent, { ICalendarEvent } from "../model/CalendarEvent";
import { CrudService } from "./crudService";

export class CalendarEventService extends CrudService<ICalendarEvent> {
    public sortEnabled = false;
    constructor() {
        super(CalendarEvent, '/api/calendarevents');
    }
}
