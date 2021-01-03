import { Component, State, Element, Prop, h } from '@stencil/core';
import { ICalendar } from "./types";
import externalDependencies from "./dependencies";
import { CalendarEventController } from './controller';
import { translation } from '../../global/translation';
import { iconList } from '../../icons/icons';
import { DateEx } from '../../model/DateEx';
import { globalStore } from '../../global/stores';
import { UserRank } from '../../model/User';

const {
    capitalize, 
    getMonthInfo, 
    deltaDate,  
    setTime, 
    betweenDate, 
} = externalDependencies;

@Component({
    tag: 'event-calendar',
    styleUrl: 'event-calendar.css',
    shadow: false
})

export class EventCalendar {

    @Element() el: HTMLDivElement;    
    @Prop() onMinimize: () => {};
    @State() state: object = {};

    private controller: CalendarEventController;

    componentWillLoad() {
        this.controller = new CalendarEventController(this.el)
        this.controller.forceUpdate = () => this.state = {};
        // some init if needed
    }

    disconnectedCallback() {
        this.controller.dispose();
        console.info('removed the event calendar from dom');
    }

    protected renderYearStackView() {

        const { dateMap, today, minDate, maxDate } = this.controller.getDateDate();
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
                    date: `${year}-01-01`,
                    filter: [[year, year + 11]],
                    text: `${year} - ${year + 11}`,
                });
                year += 12;
            }
            dateMap.push(row);
        }
        return this.renderEventCells(dateMap);
    }

    protected renderYearView(dateTime?: DateEx) {
        const { getDateDate, getStackRange } = this.controller;
        const { dateMap, today, minDate, maxDate } = getDateDate();
        const { start } = getStackRange();
        const curDate: DateEx = new DateEx(dateTime.getTime());
        curDate.set({
            year: start,
            month: 1,
            day: 1
        });

        for (let r = 0; r < 4; r++) {
            const row: ICalendar.DateMap[] = [];
            for (let c = 0; c < 3; c++) {
                const className: string[] = ['ec-cell'];
                const year = curDate.getFullYear();
                if (today.year === year) className.push('selected');
                if (+curDate < +minDate || +curDate > +maxDate) className.push('invalid');
                row.push({
                    className: className.join(' '),
                    date: `${year}-01-01`,
                    filter: [year],
                    text: year,
                });
                deltaDate(curDate, { year: 1 });
            }
            dateMap.push(row);
        }
        return this.renderEventCells(dateMap);
    }

    protected renderMonthView(dateTime?: DateEx) {
        const { config, getDateDate } = this.controller;
        const { year } = dateTime.getObjectForm();
        const { dateMap, today, minDate, maxDate } = getDateDate();
        const locale = translation[config.language as string];
        const curDate: DateEx = new DateEx(dateTime.getTime());
        curDate.set({
            year: year,
            month: 1,
            day: 1
        });
        for (let r = 0; r < 4; r++) {
            const row: ICalendar.DateMap[] = [];
            for (let c = 0; c < 3; c++) {
                const month = curDate.getMonth() + 1;
                const className: string[] = ['ec-cell'];
                if (today.year === year && today.month === month) className.push('selected');
                if (+curDate < +minDate || +curDate > +maxDate) className.push('invalid');
                row.push({
                    className: className.join(' '),
                    date: `${year}-${("" + month).padStart(2, '0')}-01`,
                    filter: [year, month],
                    text: locale.month[month - 1],
                } as ICalendar.DateMap);
                deltaDate(curDate, { month: 1 });
            }
            dateMap.push(row);
        }
        return this.renderEventCells(dateMap);
    }

    protected renderDayView(dateTime?: DateEx) {
        const { getDateDate, MAX_ROW, MAX_COL } = this.controller;
        const date = new DateEx(dateTime.getTime());
        date.set({
            day: 1,
            hour: 23,
            min: 59,
            sec: 0
        });
        const dateInfo = getMonthInfo(date);
        const curDate: DateEx = date;
        const fromPrevMonth = dateInfo.firstDay - 6;
        const { dateMap, today, minDate, maxDate } = getDateDate();
        if (dateInfo.firstDay < 6) deltaDate(curDate, { day: fromPrevMonth });
        const maxRow = Math.min(MAX_ROW, Math.ceil((dateInfo.monthLastDay - fromPrevMonth + 1) / MAX_COL));
        for (let r = 0; r < maxRow; r++) {
            const row: ICalendar.DateMap[] = [];
            for (let c = 0; c < MAX_COL; c++) {
                const { year, month, day} = curDate.getObjectForm();
                const className: string[] = ['ec-cell'];
                if (+curDate < +minDate || +curDate > +maxDate) className.push('invalid');
                if (dateInfo.month !== month) className.push('inactive');
                if (today.year === year && today.month === month && today.day === day) className.push('selected');
                row.push({
                    className: className.join(' '),
                    date: `${year}-${("" + month).padStart(2, '0')}-${("" + day).padStart(2, '0')}`,
                    filter: [year, month, day],
                    text: curDate.getDate(),
                });
                deltaDate(curDate, { day: 1 });
            }
            dateMap.push(row);
        }
        return this.renderEventCells(dateMap);
    }
  
    protected renderEventView(dateTime?: DateEx) {
        const { getEvents, onSelect, onDeleteHandler } = this.controller;
        const events = getEvents(dateTime);

        const EditIcon = iconList['Edit'];
        const DeleteIcon = iconList['Delete'];
        const user = globalStore.get('user');

        return (
            <div class="ec-list-wrapper">
                <div class="ec-list">
                    { events.length ? events.map(({ startAt, id, message, title }) => (
                        <div class="ec-bubble">
                            {user && user.rank >= UserRank.Editor && (
                                <div class="ec-actions">
                                    <div class="clickable" data-id={id} onClick={onSelect}> <EditIcon /> </div>
                                    <div class="clickable" data-id={id} onClick={onDeleteHandler}> <DeleteIcon /> </div>
                                </div>
                            )}
                            <h3>{title}</h3>
                            <p> {message} </p>
                            <time>{startAt.toMySQLDate()}</time>
                        </div>
                    )) : <div> ...üres... </div>}
                </div>
            </div>
        );
    }

    protected renderFormView() {
        const {
            selectedEvent,
            onSaveHandler,
            onDeleteHandler,
            onFormDateTimeChange,
            onGuestSelect
        } = this.controller;

        const CalendarIcon = iconList['Calendar'];
        const CalendarGuestIcon = iconList['CalendarGuest'];

        return (
            <div>
                <form-validator class="ec-form" model={this.controller.selectedEvent} submit={onSaveHandler} validate-at='SUBMIT'>
                    <input name="title" placeholder="Event title" /> 
                    <textarea name="message" rows={5} placeholder="Szöveg" />
                    <div class="ec-date-area">
                        <div> {selectedEvent.startAt.toMySQLDate()} </div>
                        <div class="button-bar">
                            <a class="ec-button" onClick={onGuestSelect}> 
                                {selectedEvent.calendarGuests.length} <CalendarGuestIcon width="20" height="20" /> 
                            </a>
                            <a class="ec-button" onClick={onFormDateTimeChange}> 
                                <CalendarIcon width="16" height="16" /> 
                            </a>
                        </div>
                    </div>

                    <input type="submit" class='ec-submit' value={ selectedEvent.id ? 'Update' : 'Save'} />
                    { selectedEvent.id && <a class="ec-button" onClick={onDeleteHandler} data-id={selectedEvent.id} data-increase="true">Delete</a>}                    
                </form-validator>
            </div>        
        );
    }

    private renderEventCells = (list: ICalendar.DateMap[][]) => {
        return list.map(week => (
            <div class="ec-row">
                { week.map(x => (
                    <div
                        data-date={x.date}
                        data-counter={this.controller.getEventCount(x.filter)}
                        class={x.className}
                        onClick={this.controller.onSelect}
                    >
                        {x.text}
                    </div>
                )) }
            </div>
        ));
    };

    public render() {
        const { viewMode, NAVIGABLE_VIEWS, config, onPrev, onNext, onIncreaseView, onSelect, getTitle } = this.controller;
        const { date, minDate, maxDate, language } = config;
        const fixedDate = setTime(betweenDate([date, minDate, maxDate]), 23, 59, 0);
        config.date = fixedDate.toMySQLDate();
        const dateInfo = fixedDate.getObjectForm();
        const title = config.getTitle 
            ? config.getTitle(viewMode, dateInfo) 
            : getTitle(dateInfo);
        const locale = translation[language as string];
        const viewName = capitalize(viewMode);
        const renderMethod = `render${viewName}View`;
        const user = globalStore.get('user');

        return (
            <div class='event-calendar'>
                <div data-ec-view={viewMode}>
                    <div class="ec-head">
                        <div class="ec-main-row">
                            { NAVIGABLE_VIEWS.includes(viewMode) && <a onClick={onPrev}>‹</a> }
                            <p class="ec-title" onClick={onIncreaseView}>{title}</p>
                            { NAVIGABLE_VIEWS.includes(viewMode) && <a onClick={onNext}>›</a> }
                            { viewMode!== 'yearStack' && (
                                <div class="ec-left-side">
                                    <a class='ec-back' onClick={onIncreaseView}>&laquo;</a>
                                    { viewMode === 'event' && user && user.rank >= UserRank.Editor && (
                                        <a class="ec-add" onClick={onSelect} data-id="0">+</a> 
                                    )}
                                </div>
                            )}
                            <div class="ec-right-side">
                                <a class="ec-close close">×</a>
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
            </div>
        );
    }
}