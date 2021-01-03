import { createStore } from "@stencil/store";
import { translation } from "../../global/translation";
import { DateEx } from "../../model/DateEx";
import { deltaDate, toDate, betweenDate } from "../../util/date";
import { IDateTimePicker } from "./types";

const availableViewModes: IDateTimePicker.ViewMode[] = ['day', 'month', 'year', 'yearStack'];

const defaultConfig: IDateTimePicker.Config = {
    title: 'Calendar',
    value: new DateEx(),
    viewMode: 'day',
    language: 'en',
    minDate: '2000-01-01 04:00:00',
    maxDate: '2114-11-02 06:00:00',     // difference should be 120 year
    onSelect: console.table,
    onCancel: () => {},
    onClose: () => console.info('closed the picker')
}

export class DateTimePickerController {
    public NAVIGABLE_VIEWS = ['year', 'month', 'day'];
    public MAX_ROW = 6;
    public MAX_COL = 7;

    public config: IDateTimePicker.Config = defaultConfig;             // config for calendar
    public forceUpdate = () => {};

    constructor(config: Partial<IDateTimePicker.Config>) {
        this.config = Object.assign({}, defaultConfig, config);
        this.ceStore.set('selectedDate', this.config.value)
        this.ceStore.set('pickerMode', this.config.pickerMode === 'time' ? 'time' : 'date');
    }

    public ceStore = createStore<IDateTimePicker.Store>({
        viewMode: 'month',
        pickerMode: 'date',
        selectedDate: new DateEx(),
    });

    public get viewMode() {
        return this.ceStore.get('viewMode');
    }

    public set viewMode(viewMode: IDateTimePicker.ViewMode) {
        this.ceStore.set('viewMode', viewMode);
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
            minDate,
            maxDate
        } = this.config;
        const newDate = betweenDate([deltaDate(this.ceStore.get('selectedDate'), { [parentView]: amount * modifier }), minDate, maxDate]);
        this.ceStore.set('selectedDate', newDate);
        this.forceUpdate();
    }

    public onIncreaseView = (): void => {
        const idx = availableViewModes.indexOf(this.viewMode);
        if (~idx && idx < (availableViewModes.length - 1)) {
            this.ceStore.set('viewMode', availableViewModes[idx + 1]);
        }
        this.forceUpdate();
	}

    public getDateDate = (): IDateTimePicker.DateData => {
        const { minDate, maxDate } = this.config;
        return {
            dateMap: [],
            today: new DateEx().getObjectForm(),
            minDate: toDate(minDate),
            maxDate: toDate(maxDate),
        }
    }

    public getStackRange = (dateTime?: DateEx): { start: number, end: number} => {
        const date = dateTime || this.ceStore.get('selectedDate');
        const curYear = date.getFullYear();
        const start = curYear - ((curYear - new DateEx(this.config.minDate).getObjectForm().year) % 12);
        return { start, end: start + 11 }
    }

    public getTitle = (dateInfo: IDateTimePicker.DateInfo): string => {
         const locale = translation[this.config.language as string];
        if (this.viewMode === 'day') {
            return `${locale.month[dateInfo.month - 1]} ${dateInfo.year}`;
        } else if (this.viewMode === 'month') {
            return `${dateInfo.year}`;
        } else if (this.viewMode === 'year') {
            const prevMonth = this.ceStore.get('selectedDate').clone();
            prevMonth.substract({ month: 1});
            const { start, end } = this.getStackRange(prevMonth);
            return `${start} - ${end}`;
        }
        return this.config.title || '';
    }

    public onSelectDate = (e: MouseEvent): void => {
        if (!e.target) return;
        const data = (e.target as HTMLElement).dataset;
        if (!data.date) { return; }
        const [year, month, day] = data.date.substr(0, 10).split('-').map(x => +x);
        const oldDate = this.ceStore.get('selectedDate');
        const selectedDate = new DateEx();
        selectedDate.set({
            year: year,
            month: month,
            day: day,
            hour: oldDate.getHours(),
            min: oldDate.getMinutes(),
            sec: 0
        })
        this.ceStore.set('selectedDate', selectedDate);
        const idx = availableViewModes.indexOf(this.viewMode);
        if (idx > 0) {
            this.ceStore.set('viewMode', availableViewModes[idx - 1]);
        }
    }

    public onSelectTime = (time: { hour?: number; minute?: number }) => {
        const { hour, minute } = time;
        const oldDate = this.ceStore.get('selectedDate');
        const date = oldDate.clone();
        if (hour) { 
            const oldHour = oldDate.getHours();
            date.set({ hour : hour + (oldHour > 12 ? 12 : 0) });
         }
        if (minute) date.set({ min: minute });
        this.ceStore.set('selectedDate', date);
    }

    public toggle12HourPeriod = () => {
        const selectedDate = this.ceStore.get('selectedDate');
        const hour = selectedDate.getHours();
        const date = this.ceStore.get('selectedDate').clone();
        date.set({ hour: hour > 12 ? (hour - 12) : (hour + 12) }); 
        this.ceStore.set('selectedDate', date);
    }

    public onSelect = (): void => {
        const selectedDate = this.ceStore.get('selectedDate');
        if (this.config.onSelect) { this.config.onSelect(selectedDate); }
        if (this.config.onClose) { this.config.onClose(); }
    }

    public onCancel = (): void => {
        if (this.config.onCancel) { this.config.onCancel(); }
        if (this.config.onClose) { this.config.onClose(); }
    }

    public dateNotSelectable(dateStr: string) {
        const minDate = this.config.minDate && new DateEx(this.config.minDate);
        const maxDate = this.config.maxDate && new DateEx(this.config.maxDate);
        const [year, month, day] = dateStr.split('-').map(x => x ? +x : x);
        if (minDate) {
            const minYear = minDate.getFullYear();
            const minMonth = minDate.getMonth() + 1;
            const minDay = minDate.getDate();
            if (year && year < minYear) {
                return true;
            }

            if (year === minYear) {
                if (month && month < minMonth) {
                    return true;
                }

                if (month === minMonth) {
                    if (day && day < minDay) {
                        return true;
                    }
                }
            }
        }

        if (maxDate) {
            const maxYear = maxDate.getFullYear();
            const maxMonth = maxDate.getMonth() + 1;
            const maxDay = maxDate.getDate();
            if (year && year > maxYear) {
                return true;
            }

            if (year === maxYear) {
                if (month && month > maxMonth) {
                    return true;
                }

                if (month === maxMonth) {
                    if (day && day > maxDay) {
                        return true;
                    }
                }
            }
        }
        return false;    
    }
}
