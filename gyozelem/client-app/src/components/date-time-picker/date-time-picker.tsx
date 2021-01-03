import { Component, State, Prop, h } from '@stencil/core';
import { IDateTimePicker } from "./types";
import externalDependencies from "./dependencies";
import { DateTimePickerController } from './controller';
import { translation } from '../../global/translation';
import { iconList } from '../../icons/icons';
import { DateEx } from '../../model/DateEx';

const {
    capitalize, 
    getMonthInfo, 
    deltaDate, 
    setTime, 
    betweenDate, 
} = externalDependencies;

@Component({
    tag: 'date-time-picker',
    styleUrl: 'date-time-picker.css',
    shadow: false
})

export class DateTimePicker {

    private controller: DateTimePickerController;

    @State() state: object = {};

    @Prop() config: Partial<IDateTimePicker.Config> = {};

    @Prop() pickerMode: IDateTimePicker.PickerMode = 'both';

    @Prop()
    onClose: () => void;
    
    componentWillLoad() {
        // some init if needed
        this.controller = new DateTimePickerController({ ...this.config, onClose: this.onClose });
        this.controller.forceUpdate = () => this.state = {};
    }

    disconnectedCallback() {
        console.info('removed the date time picker from dom')
    }

    protected renderYearStackView() {

        const { dateMap, today, minDate, maxDate } = this.controller.getDateDate();
        const minYear = minDate.getFullYear();
        const maxYear = maxDate.getFullYear();
        const selectedDate = this.controller.ceStore.get('selectedDate');

        let year = minYear;
        for (let r = 0; r < 4 && year < maxYear; r++) {
            const row: IDateTimePicker.DateMap[] = [];
            for (let c = 0; c < 3 && year < maxYear; c++) {
                const className: string[] = ['dtp-cell'];
                if (today.year >= year && today.year < (year + 12)) className.push('today');
                if (selectedDate.getFullYear() >= year && selectedDate.getFullYear() < (year + 12)) className.push('selected');
                
                row.push({
                    className: className.join(' '),
                    date: `${year}-01-01`,
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
        const { dateMap, today } = getDateDate();
        const { start } = getStackRange();
        const selectedDate = this.controller.ceStore.get('selectedDate');
        const curDate: DateEx = new DateEx(dateTime.getTime());
        curDate.set({
            year: start,
            month: 1,
            day: 1
        });

        for (let r = 0; r < 4; r++) {
            const row: IDateTimePicker.DateMap[] = [];
            for (let c = 0; c < 3; c++) {
                const className: string[] = ['dtp-cell'];
                const year = curDate.getFullYear();
                if (today.year === year) className.push('today');
                if (selectedDate.getFullYear() === year) className.push('selected');
                if (!this.controller.dateNotSelectable(`${year}`)) className.push('invalid');
                row.push({
                    className: className.join(' '),
                    date: `${year}-01-01`,
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
        const { dateMap, today } = getDateDate();
        const locale = translation[config.language];
        const selectedDate = this.controller.ceStore.get('selectedDate');
        const curDate: DateEx = new DateEx(dateTime.getTime());
        curDate.set({
            year: year,
            month: 1,
            day: 1
        });
        for (let r = 0; r < 4; r++) {
            const row: IDateTimePicker.DateMap[] = [];
            for (let c = 0; c < 3; c++) {
                const month = curDate.getMonth() + 1;
                const className: string[] = ['dtp-cell'];
                if (today.year === year && today.month === month) className.push('today');
                if (curDate.toMySQLDate().substr(0, 7) === selectedDate.toMySQLDate().substr(0, 7)) className.push('selected');
                if (this.controller.dateNotSelectable(`${year}-${month}`)) className.push('invalid');
                row.push({
                    className: className.join(' '),
                    date: `${year}-${("" + month).padStart(2, '0')}-01`,
                    text: locale.month[month - 1],
                } as IDateTimePicker.DateMap);
                deltaDate(curDate, { month: 1 });
            }
            dateMap.push(row);
        }
        return this.renderEventCells(dateMap);
    }

    protected renderDayView(dateTime?: DateEx) {
        const { getDateDate, MAX_ROW, MAX_COL } = this.controller;
        const selectedDate = this.controller.ceStore.get('selectedDate');
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
        const { dateMap, today } = getDateDate();
        if (dateInfo.firstDay < 6) deltaDate(curDate, { day: fromPrevMonth });
        const maxRow = Math.min(MAX_ROW, Math.ceil((dateInfo.monthLastDay - fromPrevMonth + 1) / MAX_COL));
        for (let r = 0; r < maxRow; r++) {
            const row: IDateTimePicker.DateMap[] = [];
            for (let c = 0; c < MAX_COL; c++) {
                const { year, month, day} = curDate.getObjectForm();
                const className: string[] = ['dtp-cell'];
                if (this.controller.dateNotSelectable(`${year}-${month}-${day}`)) className.push('invalid');
                if (dateInfo.month !== month) className.push('inactive');
                if (today.year === year && today.month === month && today.day === day) className.push('today');
                if (curDate.toMySQLDate().substr(0, 10) === selectedDate.toMySQLDate().substr(0, 10)) className.push('selected');
                row.push({
                    className: className.join(' '),
                    date: `${year}-${("" + month).padStart(2, '0')}-${("" + day).padStart(2, '0')}`,
                    text: curDate.getDate(),
                });
                deltaDate(curDate, { day: 1 });
            }
            dateMap.push(row);
        }
        return this.renderEventCells(dateMap);
    }

    private renderEventCells = (list: IDateTimePicker.DateMap[][]) => {
        return list.map(week => (
            <div class="dtp-row">
                { week.map(x => (
                    <div
                        data-date={x.date}
                        class={x.className}
                        onClick={this.controller.onSelectDate}
                    >
                        {x.text}
                    </div>
                )) }
            </div>
        ));
    };

    private renderFooter = (selectedDate: DateEx) => {
        const OkIcon = iconList['Ok'];
        const CancelIcon = iconList['Cancel'];
        const { onSelect, onCancel } = this.controller;
        return (
            <div class="dtp-footer">
                <div>{selectedDate.toMySQLDate().substr(0, 10)}</div>
                <div>{selectedDate.toLocaleTimeString()}</div>
                <a onClick={onSelect} class="dtp-button"> <OkIcon /> </a>
                <a onClick={onCancel} class="dtp-button"> <CancelIcon /> </a>
            </div>
        );
    }

    private renderDatePicker(selectedDate: DateEx) {
        const { viewMode, NAVIGABLE_VIEWS, config, onPrev, onNext, onIncreaseView, getTitle } = this.controller;
        const { minDate, maxDate, language } = config;
        const fixedDate = setTime(betweenDate([this.controller.ceStore.get('selectedDate'), minDate, maxDate]), 23, 59, 0);
        const dateInfo = fixedDate.getObjectForm();
        const title = config.getTitle 
            ? config.getTitle(viewMode, dateInfo) 
            : getTitle(dateInfo);
        const locale = translation[language];
        const viewName = capitalize(viewMode);
        const renderMethod = `render${viewName}View`;

        return (
            <div data-dtp-view={viewMode}>
                <div class="dtp-head">
                    <div class="dtp-main-row">
                        { NAVIGABLE_VIEWS.includes(viewMode) && <a onClick={onPrev}>‹</a> }
                        <p class="dtp-title" onClick={onIncreaseView}>{title}</p>
                        { NAVIGABLE_VIEWS.includes(viewMode) && <a onClick={onNext}>›</a> }
                        { viewMode!== 'yearStack' && (
                            <div class="dtp-left-side">
                                <a class='dtp-back' onClick={onIncreaseView}>&laquo;</a>
                            </div>
                        )}
                        <div class="dtp-right-side">
                            <a class="dtp-close close">×</a>
                        </div>
                    </div>
                </div>
                { viewMode === 'day' && (
                    <div class="dtp-subhead">
                        <div class="dtp-row">
                            {locale.dayShort.map((x: string) => <div class="dtp-cell">{x}</div>)}
                        </div>
                    </div>
                )}
                <div class="dtp-body">
                    {this[renderMethod](fixedDate)}
                </div>
                
                {this.renderFooter(selectedDate)}
            </div>            
        );
    }

    private renderTimePicker(selectedDate: DateEx) {
        const { onSelectTime, toggle12HourPeriod } = this.controller;

        const hour = selectedDate.getHours() % 12;
        const minute = selectedDate.getMinutes();

        const center_y = 186;
        const center_x = 186;
        const fontSize = 24;
        const centerRadius = 6.695;
        const centerStrokeWeight = 5

        const hourAngle = 30;
        const hourTextRadius = 186;

        const minuteDotRadius = 160;
        const minuteAngle = 360 / 60;

        const lineAngle = 90;
        const lineRadius = minuteDotRadius + 5;

        const minuteDots = new Array(60).fill(1).map((_, x) => {
            return (
                <g>
                    <circle 
                        class={x % 5 === 0 ? 'hour' : 'minute'}
                        cx={center_x + minuteDotRadius * Math.cos(minuteAngle*x * Math.PI / 180)} 
                        cy={center_y + minuteDotRadius * Math.sin(minuteAngle*x * Math.PI / 180)}
                        r="3"
                    />
                    <circle 
                        fill-opacity="0"
                        class="clickable"
                        cx={center_x + minuteDotRadius * Math.cos((minuteAngle*x-90) * Math.PI / 180)} 
                        cy={center_y + minuteDotRadius * Math.sin((minuteAngle*x-90) * Math.PI / 180)}
                        r="12"
                        onClick={() => onSelectTime({ minute: x % 60 })} 
                    />
                </g>
            );
        });

        const hourTexts = new Array(12).fill(1).map((_, x) => {
            return (
                <text 
                    class="clickable"
                    transform="translate(32 24)"  
                    onClick={() => onSelectTime({ hour: x + 1 })}
                >
                    <tspan 
                        x={center_x + hourTextRadius * Math.cos((hourAngle*x - 60) * Math.PI / 180) - (fontSize * ( x < 9 ? 1.25 : 1.5))} 
                        y={center_y + hourTextRadius * Math.sin((hourAngle*x - 60) * Math.PI / 180)}
                    >
                        {x + 1}
                    </tspan>
                </text>
            );
        });

        const lines = new Array(4).fill(1).map((_, x) => {
            return (
                <polygon 
                    points={`${center_x + lineRadius * Math.cos((lineAngle*x - 88) * Math.PI / 180)},${center_y + lineRadius * Math.sin((lineAngle*x - 88) * Math.PI / 180)} ${center_x + lineRadius * Math.cos((lineAngle*x - 92) * Math.PI / 180)},${center_y + lineRadius * Math.sin((lineAngle*x - 92) * Math.PI / 180)} ${center_x + (lineRadius - 15) * Math.cos((lineAngle*x - 90) * Math.PI / 180)},${center_y + (lineRadius - 15) * Math.sin((lineAngle*x - 90) * Math.PI / 180)}`}
                    style={{ stroke: 'rgba(0,0,0,0.5)', strokeWidth: '1', fill: 'rgba(0,0,0,0.75)'}}  
                />
            );
        });

        const hourHand = (
            <polygon 
                class="hour-hand"
                points={`${center_x + centerRadius * Math.cos((hourAngle*hour - 90) * Math.PI / 180)},${center_y + centerRadius * Math.sin((hourAngle*hour - 90) * Math.PI / 180)} ${center_x + (minuteDotRadius / 3) * Math.cos((hourAngle*hour - 94) * Math.PI / 180)},${center_y + (minuteDotRadius / 3) * Math.sin((hourAngle*hour - 94) * Math.PI / 180)} ${center_x + (lineRadius * 0.75 - 25) * Math.cos((hourAngle*hour - 90) * Math.PI / 180)},${center_y + (lineRadius * 0.75 - 25) * Math.sin((hourAngle*hour - 90) * Math.PI / 180)} ${center_x + (minuteDotRadius / 3) * Math.cos((hourAngle*hour - 86) * Math.PI / 180)},${center_y + (minuteDotRadius / 3) * Math.sin((hourAngle*hour - 86) * Math.PI / 180)}`}
            />
        );

        const minuteHand = (
            <polygon 
                class="minute-hand"
                points={`${center_x + centerRadius * Math.cos((minuteAngle*minute - 90) * Math.PI / 180)},${center_y + centerRadius * Math.sin((minuteAngle*minute - 90) * Math.PI / 180)} ${center_x + (minuteDotRadius / 3) * Math.cos((minuteAngle*minute - 92) * Math.PI / 180)},${center_y + (minuteDotRadius / 3) * Math.sin((minuteAngle*minute - 92) * Math.PI / 180)} ${center_x + (lineRadius - 25) * Math.cos((minuteAngle*minute - 90) * Math.PI / 180)},${center_y + (lineRadius - 25) * Math.sin((minuteAngle*minute - 90) * Math.PI / 180)} ${center_x + (minuteDotRadius / 3) * Math.cos((minuteAngle*minute - 88) * Math.PI / 180)},${center_y + (minuteDotRadius / 3) * Math.sin((minuteAngle*minute - 88) * Math.PI / 180)}`}
            />
        );

        return (
            <div class="tp-body">
                <div class="tp-head">
                    <button onClick={toggle12HourPeriod}>{selectedDate.getHours() > 12 ? 'PM' : 'AM'}</button>
                </div>
                <div class="tp-clock">
                    <svg width="100%" height="100%" viewBox="0 0 448 448" xmlns="http://www.w3.org/2000/svg">
                        <g fill="none" fill-rule="evenodd">
                            <path d="M-9-9h501v501H-9z"></path>
                            <g transform="translate(24 24)">
                                <circle stroke="rgba(0,0,0,0.25)" stroke-width="4" fill="white" stroke-linecap="square" cx="200" cy="200" r="216"></circle>
                                <circle stroke="rgba(0,0,0,0.5)" stroke-width="4" fill="white" stroke-linecap="square" cx="200" cy="200" r="212"></circle>
                                <g fill="#000" font-family="HelveticaNeue-Bold, Helvetica Neue" font-size={fontSize} font-weight="bold" opacity=".9">
                                    {hourTexts}
                                </g>
                                <g transform="translate(13.793 13.22)">
                                    {minuteDots}
                                    {lines}
                                    {hourHand}
                                    {minuteHand}
                                    <circle stroke="black" stroke-width={centerStrokeWeight} cx={center_x} cy={center_y} r={centerRadius}></circle>
                                </g>
                            </g>
                        </g>
                    </svg>
                </div>
                {this.renderFooter(selectedDate)}
            </div>
        );
    }

    public render() {
        const { ceStore } = this.controller;
        const { pickerMode, selectedDate } = ceStore.state;
        ceStore.get('selectedDate')
        const ClockIcon = iconList['Clock'];
        const CalendarIcon = iconList['Calendar'];
        
        return (
            <div class='date-time-picker'>
                {(!this.pickerMode || this.pickerMode === 'both') && (
                    <div class='dtp-sidebar'>
                        <div 
                            class={`tab ${pickerMode === 'date' ? 'active' : ''}`}
                            onClick={() => ceStore.set('pickerMode', 'date')}
                        >
                            <CalendarIcon />
                        </div>                    

                        <div 
                            class={`tab ${pickerMode === 'time' ? 'active' : ''}`}
                            onClick={() => ceStore.set('pickerMode', 'time')}
                        >
                            <ClockIcon />
                        </div>
                    </div>
                )}
                {pickerMode === 'date' && this.renderDatePicker(selectedDate)}
                {pickerMode === 'time' && this.renderTimePicker(selectedDate)}
            </div>
        );
    }
}