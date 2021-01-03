import { createStore } from "@stencil/store";
import { broadcast } from "../../global/Broadcast";
import { translation } from "../../global/translation";
import CalendarEvent, { ICalendarEvent } from "../../model/CalendarEvent";
import CalendarGuest from "../../model/CalendarGuest";
import { DateEx } from "../../model/DateEx";
import { CalendarEventService } from "../../services/calendar-service";
import { plainToClass } from "../../util/classTransform";
import { deltaDate, toDate, betweenDate } from "../../util/date";
import { ICalendar } from "./types";

const availableViewModes: ICalendar.ViewMode[] = ['form', 'event', 'day', 'month', 'year', 'yearStack'];

const defaultConfig: ICalendar.Config = {
    title: 'Calendar',
    list: [],
    date: (new DateEx()).toMySQLDate(),
    viewMode: 'day',
    language: 'en',
    minDate: '2000-01-01 04:00:00',
    maxDate: '2114-11-02 06:00:00',     // difference should be 120 year
}

interface State {
    viewMode: ICalendar.ViewMode;
}

export class CalendarEventController {

    private service = new CalendarEventService();
    private broadcast = broadcast;

    public forceUpdate = () => {};
    public list: Record<string, any> = {};
    public NAVIGABLE_VIEWS = ['year', 'month', 'day'];
    public selectedEvent: CalendarEvent;
    public MAX_ROW = 6;
    public MAX_COL = 7;
    public config: ICalendar.Config = defaultConfig;             // config for calendar

    private panelIds = {
        datePicker: Math.random().toString(),
        guestManager: Math.random().toString(),
    }

    public ceStore = createStore<State>({
        viewMode: 'month',
    });

    constructor(public panelElem: HTMLDivElement) {
        this.service.getList();
    }

    public get viewMode() {
        return this.ceStore.get('viewMode');
    }

    public set viewMode(viewMode: ICalendar.ViewMode) {
        this.ceStore.set('viewMode', viewMode);
    }

    public get items() {
        return this.service.items;
    }

    public set items(items: ICalendarEvent[]) {
        this.service.items = items;
    }

    public reset = (): void => {
        this.config = defaultConfig;
        this.viewMode = defaultConfig.viewMode;
    }

    public onNext = (): void => this.moveCalendar(1);
    public onPrev = (): void => this.moveCalendar(-1);

    private moveCalendar = (modifier = 1): void => {
        const idx = this.NAVIGABLE_VIEWS.indexOf(this.viewMode);
        const parentView = this.NAVIGABLE_VIEWS[idx > 0 ? idx - 1 : 0];
        const amount = this.viewMode === 'year' ? 12 : 1;
        const {
            date,
            minDate,
            maxDate
        } = this.config;
        const newDate = betweenDate([deltaDate(date, { [parentView]: amount * modifier }), minDate, maxDate]);
        this.config.date = newDate.toMySQLDate().substr(0, 10);
        this.forceUpdate();
    }

    public onIncreaseView = (): void => {
        const idx = availableViewModes.indexOf(this.viewMode);
        if (~idx && idx < (availableViewModes.length - 1)) {
            this.ceStore.set('viewMode', availableViewModes[idx + 1]);
        } else {
            this.forceUpdate();
        }
    }
    
    public openDateTimePicker = (cb: (date: DateEx) => void) => {
        this.broadcast.emit('panel:init', { 
            componentTag: 'date-time-picker', 
            componentProps: {
                config: {
                    value: this.selectedEvent ? this.selectedEvent.startAt : undefined,
                    onSelect: cb,
                    pickerMode: 'time'
                },
                pickerMode: 'both'
            },
            containerConfig: { 
                title: 'Date Time Picker',
                customHeader: '.dtp-head',
            },
            windowId: this.panelIds.datePicker,
            linkWithCaller: true, 
            callerWindowId: this.panelElem.dataset.componentId
        });
    }

    public getEventCount = (keys: ICalendar.DateMap['filter']): number => {
        if (!keys) return 0;
        const [year, month, day] = keys;
        const filteredItems = this.service.items.filter(x => {
            const date = x.startAt;
            const iYear = date.getFullYear();
            const iMonth = date.getMonth() + 1;
            const iDay = date.getDate();

            return (
                (
                    !year || (Array.isArray(year) ? (iYear >= year[0] && iYear <= year[1]) : year === iYear)
                ) && (
                    !month || month === iMonth
                ) && (
                    !day || day === iDay
                )
            );
        });
        return filteredItems.length;
    }

    public getEvents = (dateTime?: DateEx): ICalendarEvent[] => {
        const dateStr = dateTime.toMySQLDate().substr(0, 10);
        return this.service.items.filter(x => x.startAt instanceof DateEx && x.startAt.toMySQLDate().substr(0, 10) === dateStr);
    }

    public getDateDate = (): ICalendar.DateData => {
        const { minDate, maxDate } = this.config;
        return {
            dateMap: [],
            today: (new DateEx()).getObjectForm(),
            minDate: toDate(minDate),
            maxDate: toDate(maxDate),
        }
    }

    public getStackRange = (dateTime?: DateEx): { start: number, end: number} => {
        const date = dateTime || new DateEx(DateEx.parse(this.config.date));
        const curYear = date.getFullYear();
        const start = curYear - ((curYear - (new DateEx(this.config.minDate)).getObjectForm().year) % 12);
        return { start, end: start + 11 }
    }

    public getTitle = (dateInfo: ICalendar.DateInfo): string => {
         const locale = translation[this.config.language as string];
        if (this.viewMode === 'day') {
            return `${locale.month[dateInfo.month - 1]} ${dateInfo.year}`;
        } else if (this.viewMode === 'month') {
            return `${dateInfo.year}`;
        } else if (this.viewMode === 'year') {
            const { year, month, day } = (new DateEx(this.config.date)).getObjectForm();
            const { start, end } = this.getStackRange(new DateEx(year, month - 1, day));
            return `${start} - ${end}`;
        }
        return this.config.title || '';
    }

    public onSaveHandler = async (data: ICalendarEvent): Promise<void> => {
        if (typeof data.id === 'undefined') delete data.id;
        try {
            await this.service.savePromise(data);
            this.onIncreaseView();
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    public onSelect = (e: MouseEvent): void => {
        if (!e.target) return;
        const data = (e.currentTarget as HTMLElement).dataset;
        if (data.id) {
            const id = data.id;
            let event: Partial<ICalendarEvent>;
            if (!id) {
                const selectedDate = this.config.date;
                event = plainToClass({
                    startAt: selectedDate ? new DateEx(selectedDate) : new DateEx(),
                    message: '',
                    title: ''
                }, CalendarEvent);
            } else {
                try {
                    event = this.service.items.find(x => x.id === id) || new CalendarEvent();
                } catch(err) {
                    console.warn(err);
                }
                if (!event) return;
            }
            this.selectedEvent = event as ICalendarEvent;
        } else if (data.date) {
            this.config.date = data.date;
        }
        const idx = availableViewModes.indexOf(this.viewMode);
        if (idx === 0) return console.warn('it is day view');
        this.ceStore.set('viewMode', availableViewModes[idx - 1]);
    }

    public onDeleteHandler = async (e: MouseEvent) => {
        const dataset = (e.currentTarget as HTMLElement).dataset;
        const { id, increase } = dataset;
        let event: ICalendarEvent;
        try {
            if (!id) return;
            event = this.service.items.find(x => x.id === id);
        } catch (err) {
            return console.error('Event not exist!', err);
        }
        try {
            this.service.deletePromise(event.id);
            if (increase) { this.onIncreaseView(); }
        } catch(err) {
            console.error(err);
            throw err;
        }
    }

    public onFormDateTimeChange = (ev: MouseEvent) => { 
        this.openDateTimePicker((date: DateEx) => {
            this.selectedEvent.startAt = date;
            this.forceUpdate();
        }); 
        ev.preventDefault();
        return false;
    }

    public onGuestSelect = (ev: MouseEvent) => {
        this.broadcast.emit('panel:init', { 
            componentTag: 'guest-manager', 
            componentProps: {               
                onSelect: (ids: string[]) => {
                    const calendarEventId = this.selectedEvent.id;
                    const calendarGuests = ids.map(guestId => plainToClass({ guestId, calendarEventId }, CalendarGuest));
                    this.selectedEvent.calendarGuests = calendarGuests;
                    this.forceUpdate();
                },
                selectedIds: this.selectedEvent.calendarGuests.map(x => x.guestId)
            },
            containerConfig: { 
                title: 'Guest Manager',
                mouseEvent: ev,
            },
            windowId: this.panelIds.guestManager,
            linkWithCaller: true, 
            callerWindowId: this.panelElem.dataset.componentId
        });
        ev.preventDefault();
        return false;
    }

    public dispose() {
        if (this.service) {
            this.service.dispose();
        }
    }    
}
