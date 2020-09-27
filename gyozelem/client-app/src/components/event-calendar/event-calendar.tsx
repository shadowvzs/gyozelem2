import { Component, State, Prop, Host, h } from '@stencil/core';
import { ICalendar } from "./types";
import { CalendarEvent } from "./CalendarEvent";
import externalDependencies from "./dependencies";

const {
    capitalize, 
    getDeepProp, 
    getMonthInfo, 
    toDate, 
    setDate, 
    deltaDate, 
    getDate, 
    toMysqlDate, 
    setTime, 
    betweenDate, 
    to2digit,
    Draggable
} = externalDependencies;

const defaultConfig: ICalendar.Config = {
    title: 'Calendar',
    list: [],
    date: toMysqlDate(new Date()),
    viewMode: 'day',
    language: 'en',
    minDate: '2000-01-01 04:00:00',
    maxDate: '2114-11-02 06:00:00',     // difference should be 120 year
}

const translation = {
    'en': {
        dayShort: ['Mon', 'Tue', 'Wed', 'Tue', 'Fri', 'Sat', 'Sun'],
        day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        month: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    },
    'hu': {
        dayShort: ['Htf', 'Kdd', 'Sze', 'Csü', 'Pén', 'Szo', 'Vas'],
        day: ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'],
        month: ['Január', 'Február', 'Március', 'Április', 'Május', 'Június', 'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December']
    }
}

const availableViewModes: ICalendar.ViewMode[] = ['form', 'event', 'day', 'month', 'year', 'yearStack'];

@Component({
    tag: 'event-calendar',
    styleUrl: 'event-calendar.css',
    shadow: true
})


export class EventCalendar {
    private $elem: HTMLDivElement;
    private list: Record<string, any> = {};
    private selectedEvent: ICalendar.Event;

    private MAX_ROW = 6;
    private MAX_COL = 7;
    private NAVIGABLE_VIEWS = ['year', 'month', 'day'];
    private config: ICalendar.Config = defaultConfig;             // config for calendar

    @State() state: ICalendar.State = {
        viewMode: 'day',                  // play another audio if current is ended
    }

    // cannot add custom type to promise :/
    // @Prop() onSave: (data: ICalendar.Event) => Promise<ICalendar.Event>;
    @Prop() onSave: (data: ICalendar.Event) => Promise<any>;
    @Prop() onDelete: (data: ICalendar.Event) => Promise<void>;
    @Prop() draggable: boolean;
    @Prop() onMinimize: () => {};

    componentDidLoad() {
        // Optional: we can make the window draggable :)
        if (this.draggable && this.$elem && Draggable) {
            new Draggable(this.$elem, this.$elem.querySelector('.ec-head'));
        }
    }

    private setState = (state: Partial<ICalendar.State>) => {
        this.state = {...this.state, ...state };
    }

    private forceUpdate() {
        this.setState({...this.state});
    }

    protected reset = (): void => {
        this.config = defaultConfig;
        this.setState({ viewMode: defaultConfig.viewMode });
    }

    protected onNext = (): void => {
        this.moveCalendar(1);
    }

    protected onPrev = (): void => {
        this.moveCalendar(-1);
    }

    protected moveCalendar = (modifier = 1): void => {
        const { viewMode } = this.state;
        const idx = this.NAVIGABLE_VIEWS.indexOf(viewMode);
        const parentView = this.NAVIGABLE_VIEWS[idx > 0 ? idx - 1 : 0];
        const amount = viewMode === 'year' ? 12 : 1;
        const {
            date,
            minDate,
            maxDate
        } = this.config;
        const newDate = betweenDate([deltaDate(date, { [parentView]: amount * modifier }), minDate, maxDate]);
        this.config.date = newDate.toISOString();
        this.forceUpdate();
    }

    protected onIncreaseView = (): void => {
        const { viewMode } = this.state;
        const idx = availableViewModes.indexOf(viewMode);
        if (~idx && idx < (availableViewModes.length - 1)) {
            this.setState({ viewMode: availableViewModes[idx + 1] });
        } else {
            this.forceUpdate();
        }
	}

    private onSelect = (e: MouseEvent): void => {
        if (!e.target) return;
        const data = (e.target as HTMLElement).dataset;
        if (data.id) {
            const id = +data.id;
            let event: Pick<ICalendar.Event, 'title' | 'message'> | ICalendar.Event | undefined;
            if (id === 0) {
                const selectedDate = this.config.date;
                event = {
                    createdAt: selectedDate ? selectedDate.substr(0,11) + '16:00:00' : toMysqlDate(new Date()),
                    message: '',
                    title: ''
                };
            } else {
                try {
                    const [ year, month, day ] = this.config.date.split(' ')[0].split('-');
                    event = (this.list[year][month][day].list as ICalendar.Event[]).find(x => +x.id === id);
                } catch(err) {
                    console.warn(err);
                }
                if (!event) return;
            }
            this.selectedEvent = event as ICalendar.Event;
        } else if (data.date) {
            this.config.date = data.date;
        }
        const idx = availableViewModes.indexOf(this.state.viewMode);
        if (idx === 0) return console.warn('it is day view');
        this.setState({ viewMode: availableViewModes[idx - 1] })
    }

    private onSaveHandler = async (data: ICalendar.Event): Promise<void> => {
        if (typeof data.id === 'undefined') delete data.id;
        try {
            if (this.onSave) {
                data = await this.onSave({ ...data });
            }
            this[data.id ? 'updateEvent' : 'addEvent'](data);
            this.onIncreaseView();
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    protected onDeleteHandler = async (e: MouseEvent) => {
        const id = (e.target as HTMLElement).dataset.id;
        let event: ICalendar.Event;
        try {
            const keys = this.config.date.split(' ')[0];
            if (!id) return;
            const [ year, month, day ] = keys.split('-');
            event = this.list[year][month][day].list.find(e => e.id === +id);
        } catch (err) {
            return console.error('Event not exist!', err);
        }
        try {
            if (this.onDelete) {
                await this.onDelete(event);
            }
            this.deleteEvent(event);
            this.onIncreaseView();
        } catch(err) {
            console.error(err);
            throw err;
        }
    }

    public async initCalendar(config: Partial<ICalendar.Config>): Promise<void> {
        if (!config) return;
        const newConfig = Object.assign({}, defaultConfig as ICalendar.Config, config as Partial<ICalendar.Config>) as ICalendar.Config;
        this.config = newConfig;
        this.listToMap(newConfig.list);
        const { date, minDate, maxDate } = newConfig;
        this.config.date = toMysqlDate(betweenDate([date, minDate, maxDate]));
        Object.assign(this.config, { minDate, maxDate });
        this.setState({ 'viewMode': newConfig.viewMode as ICalendar.ViewMode })
    }

    protected getEventKey = (ev: ICalendar.Event): string[] => {
        if (!ev.createdAt) return [];
        return ev.createdAt.split(' ')[0].split('-');
    }

    protected updateEvent = (ev: ICalendar.Event): boolean => {
        const [ year, month, day ] = this.getEventKey(ev);
        try {
            const list = this.list[year][month][day].list;
            const idx = list.findIndex(e => +e.id === +ev.id);
            if (~idx) {
                ev.id = +ev.id;
                list[idx] = ev;
                return true;
            }
        } catch(e) {
            // fail
        }
        return false;
    }

    protected deleteEvent = (ev: ICalendar.Event): boolean => {
        const [ year, month, day ] = this.getEventKey(ev);
        try {
            const list = this.list[year][month][day].list;
            const idx = list.findIndex(e => e.id === ev.id);
            if (~idx) {
                list.splice(idx, 1);
                this.list[year].count--;
                this.list[year][month].count--;
                return true;
            }
        } catch(e) {
            // fail
        }
        return false;
    }

    protected addEvent = (ev: ICalendar.Event) => {
        const l = this.list;
        if (!ev.createdAt) return;
        const [ year, month, day ] = this.getEventKey(ev);
        if (!l[year]) l[year] = { count: 0 };
        if (!l[year][month]) l[year][month] = { count: 0 };
        if (!l[year][month][day]) l[year][month][day] = {
            list: [],
            get count() { return this.list.length; }
        };
        l[year][month].count++;
        l[year].count++;
        l[year][month][day].list.push(ev);
    }

    public listToMap = (list: ICalendar.Event[]): Record<string, any> => {
        this.list = {};
        list.forEach(this.addEvent);
        return list;
    }

    protected getEventCount = (keys: number[]): number => {
        let target: Record<string, any> = this.list;
        if (!keys) return 0;
        if (keys.length === 1 && Array.isArray(keys[0])) {
            const [ start, end ] = keys[0];
            return Object.keys(target)
                .filter(x => x >= start && x <= end)
                .reduce((t, x) => t + target[x].count, 0);
        }
        for (const key of keys) {
            target = target[to2digit(key)];
            if (!target) return 0;
        }
        return target.count || 0;
    }

    protected getEvents = (dateTime?: string): ICalendar.Event[] => {
        const {year, month, day} = getDate(dateTime);
        return getDeepProp(this.list, `${year}.${to2digit(month)}.${to2digit(day)}.list`, []);
    }

    protected getDateDate = (): ICalendar.DateData => {
        const { minDate, maxDate } = this.config;
        return {
            dateMap: [],
            today: getDate(),
            minDate: toDate(minDate),
            maxDate: toDate(maxDate),
        }
    }

    protected getStackRange = (dateTime?: string | Date): { start: number, end: number} => {
        const date = toDate(dateTime || this.config.date);
        const curYear = date.getFullYear();
        const start = curYear - ((curYear - getDate(this.config.minDate).year) % 12);
        return { start, end: start + 11 }
    }

    public getTitle = (dateInfo: ICalendar.DateInfo): string => {
        const { viewMode } = this.state;
        const locale = translation[this.config.language as string];
        if (viewMode === 'day') {
            return `${locale.month[dateInfo.month - 1]} ${dateInfo.year}`;
        } else if (viewMode === 'month') {
            return `${dateInfo.year}`;
        } else if (viewMode === 'year') {
            const { year, month, day } = getDate(this.config.date);
            const { start, end } = this.getStackRange(new Date(year, month - 1, day));
            return `${start} - ${end}`;
        }
        return this.config.title || '';
    }

    protected renderYearStackView() {

        const { dateMap, today, minDate, maxDate } = this.getDateDate();
        const minYear = minDate.getFullYear();
        const maxYear = maxDate.getFullYear();

        let year = minYear;
        for (let r = 0; r < 4 && year < maxYear; r++) {
            const row: ICalendar.DateMap[] = [];
            for (let c = 0; c < 3 && year < maxYear; c++) {
                const className: string[] = ['ec-cell'];
                if (today.year >= year && today.year < (year + 12)) className.push('selected');
                row.push({
                    className: className.join(' '),
                    date: [year, '01', '01'],
                    filter: [[year, year + 11]],
                    text: `${year} - ${year + 11}`,
                });
                year += 12;
            }
            dateMap.push(row);
        }
        return this.renderEventCells(dateMap);
    }

    protected renderYearView(dateTime?: string) {
        const { dateMap, today, minDate, maxDate } = this.getDateDate();
        const { start } = this.getStackRange();
        const curDate: Date = setDate(dateTime as string, 1, 1, start);
        for (let r = 0; r < 4; r++) {
            const row: ICalendar.DateMap[] = [];
            for (let c = 0; c < 3; c++) {
                const className: string[] = ['ec-cell'];
                const year = curDate.getFullYear();
                if (today.year === year) className.push('selected');
                if (+curDate < +minDate || +curDate > +maxDate) className.push('invalid');
                row.push({
                    className: className.join(' '),
                    date: [year, '01', '01'],
                    filter: [year],
                    text: year,
                });
                deltaDate(curDate, { year: 1 });
            }
            dateMap.push(row);
        }
        return this.renderEventCells(dateMap);
    }

    protected renderMonthView(dateTime?: string) {
        const { year } = getDate(dateTime);
        const { dateMap, today, minDate, maxDate } = this.getDateDate();
        const locale = translation[this.config.language as string];
        const curDate: Date = setDate(dateTime as string, 1, 1, year);
        for (let r = 0; r < 4; r++) {
            const row: ICalendar.DateMap[] = [];
            for (let c = 0; c < 3; c++) {
                const month = curDate.getMonth() + 1;
                const className: string[] = ['ec-cell'];
                if (today.year === year && today.month === month) className.push('selected');
                if (+curDate < +minDate || +curDate > +maxDate) className.push('invalid');
                row.push({
                    className: className.join(' '),
                    date: [year, ("" + month).padStart(2, '0'), '01'],
                    filter: [year, month],
                    text: locale.month[month - 1],
                } as ICalendar.DateMap);
                deltaDate(curDate, { month: 1 });
            }
            dateMap.push(row);
        }
        return this.renderEventCells(dateMap);
    }

    protected renderDayView(dateTime?: string) {
        const date = new Date(toMysqlDate(dateTime as string).substr(0, 8) + '01 23:59:59');
        const dateInfo = getMonthInfo(date);
        const curDate: Date = date;
        const fromPrevMonth = dateInfo.firstDay - 6;
        const { dateMap, today, minDate, maxDate } = this.getDateDate();
        if (dateInfo.firstDay < 6) deltaDate(curDate, { day: fromPrevMonth });
        const maxRow = Math.min(this.MAX_ROW, Math.ceil((dateInfo.monthLastDay - fromPrevMonth + 1) / this.MAX_COL));
        for (let r = 0; r < maxRow; r++) {
            const row: ICalendar.DateMap[] = [];
            for (let c = 0; c < this.MAX_COL; c++) {
                const { year, month, day} = getDate(curDate);
                const className: string[] = ['ec-cell'];
                if (+curDate < +minDate || +curDate > +maxDate) className.push('invalid');
                if (dateInfo.month !== month) className.push('inactive');
                if (today.year === year && today.month === month && today.day === day) className.push('selected');
                row.push({
                    className: className.join(' '),
                    date: [year, month, day],
                    filter: [year, month, day],
                    text: curDate.getDate(),
                });
                deltaDate(curDate, { day: 1 });
            }
            dateMap.push(row);
        }
        return this.renderEventCells(dateMap);
    }
  
    protected renderEventView(dateTime?: string) {
        const events = this.getEvents(dateTime);
        return (
            <div>
                <div class="ec-list">
                    { events.length ? events.map(({ createdAt, id, message, title }) => (
                        <div class="ec-bubble">
                            <h3 onClick={this.onSelect} data-id={id}>{title}</h3>
                            <p onClick={this.onSelect} data-id={id}> {message} </p>
                            <time>{createdAt}</time>
                        </div>
                    )) : <div> ...üres... </div>}
                </div>
            </div>
        );
    }

    private extractFormData = (event: InputEvent) => {
        const data = {};
        const $form = event.target as HTMLFormElement;
        const inputs = Array.from($form.querySelectorAll('input,textarea')) as HTMLInputElement[];
        inputs.filter(x => x.name).forEach(x => {
            data[x.name] = x.value;
        });
        event.preventDefault();
        event.stopPropagation();
        return data as ICalendar.Event;
    }
    
    protected renderFormView() {
        const {
            createdAt,
            id,
            message,
            title,
        } = this.selectedEvent || {};
        // const { hour, min } = getDate(createdAt);
        
        // const time = to2digit(hour || 1) + ':' + to2digit(min || 0);
        const model = Object.assign(new CalendarEvent(), {
            id,
            message,
            title,
            createdAt
        });

        // todo this part
        console.log(model);

        return (
            <div>
                <form class="ec-form" onSubmit={(event: InputEvent) => this.onSaveHandler(this.extractFormData(event))}>
                    <input name="title" placeholder="Event title" /> 
                    <textarea name="message" rows={5} placeholder="Szöveg"></textarea>
                    <input name="createdAt" placeholder="yy:mm:dd hh:mm:ss" />
                    <input type="submit" class='ec-submit' value={ id ? 'Update' : 'Save'} />
                    { id && <a class="ec-button" onClick={this.onDeleteHandler} data-id={id}>Delete</a>}
                </form>                
            </div>        
        );
    }

    private onMinimizeHandler(): void {
        if (this.onMinimize) { this.onMinimize(); }
        this.reset()
    }
    
    private renderEventCells = (list: ICalendar.DateMap[][]) => {
        return list.map(week => (
            <div class="ec-row">
                { week.map(x => (
                    <div
                        data-date={x.date.map(y => y.length === 1 ? '0' + y : y).join('-')}
                        data-counter={this.getEventCount(x.filter)}
                        class={x.className}
                        onClick={this.onSelect}
                    >
                        {x.text}
                    </div>
                )) }
            </div>
        ));
    };

    public render() {

        const {
            viewMode
        } = this.state;

        const { date, minDate, maxDate } = this.config;
        const fixedDate = setTime(betweenDate([date, minDate, maxDate]), 23, 59, 59);
        this.config.date = toMysqlDate(fixedDate);
        const dateInfo = getDate(fixedDate);
        const title = this.config.getTitle 
            ? this.config.getTitle(viewMode, dateInfo) 
            : this.getTitle(dateInfo);
        const locale = translation[this.config.language as string];
        const viewName = capitalize(viewMode);
        const renderMethod = `render${viewName}View`;

        return (
            <Host ref={(el: HTMLDivElement) => this.$elem = el}>
                <div data-ec-view={viewMode}>
                    <div class="ec-head">
                        <div class="ec-main-row">
                            { !!~this.NAVIGABLE_VIEWS.indexOf(viewMode) && <a onClick={this.onPrev}>‹</a> }
                            <p class="ec-title" onClick={this.onIncreaseView}>{title}</p>
                            { !!~this.NAVIGABLE_VIEWS.indexOf(viewMode) && <a onClick={this.onNext}>›</a> }
                            { viewMode!== 'yearStack' && (
                                <div class="ec-left-side">
                                    <a class='ec-back' onClick={this.onIncreaseView}>&laquo;</a>
                                    { viewMode === 'event' && <a class="ec-add" onClick={this.onSelect} data-id="0">+</a> }
                                </div>
                            )}
                            <div class="ec-right-side">
                                { this.onMinimize && <a class="ec-close" onClick={this.onMinimizeHandler}>×</a>}
                            </div>
                        </div>
                    </div>
                    { viewMode === 'day' && (
                        <div class="ec-subhead">
                            <div class="ec-row">
                                {locale.dayShort.map((x: string) => <div class="ec-cell">{x}</div>)}
                            </div>
                        </div>
                    )}
                    <div class="ec-body">
                        {this[renderMethod](fixedDate)}
                    </div>
                </div>
            </Host>
        );
    }
}