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
        date: any[];
        filter: any[];
        text: string | number;
    }

    interface DateData {
        dateMap: DateMap[][];
        today: DateInfo;
        minDate: Date;
        maxDate: Date;
    }

    interface DateInfo {
        year: number;
        month: number;
        day: number;
    }

}