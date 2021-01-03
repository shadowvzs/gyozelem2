import { DateEx } from "../../model/DateEx";

export declare namespace ICalendar {

    interface Event {
        id: number;
        user_id?: number;
        title: string;
        message: string;
        createdAt?: string;
        updatedAt?: string;
    }

    interface State {
        viewMode: ICalendar.ViewMode;
    }
    
    type ViewMode = 'form' | 'event' | 'day' | 'month' | 'year' | 'yearStack';
    
    interface Config {
        element?: HTMLElement;
        list: [];
        title?: string;
        date: string;
        viewMode?: ViewMode;
        language?: string;
        minDate: string;
        maxDate: string;
        getTitle?: (viewMode: ViewMode, dateInfo: DateInfo) => string;
    }

    interface DateMap {
        className: string;
        date: string;
        filter: [number | number[], number?, number?];
        text: string | number;
    }

    interface DateData {
        dateMap: DateMap[][];
        today: DateInfo;
        minDate: DateEx;
        maxDate: DateEx;
    }

    interface DateInfo {
        year: number;
        month: number;
        day: number;
    }

}