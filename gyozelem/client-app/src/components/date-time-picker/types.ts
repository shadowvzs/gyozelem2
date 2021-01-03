import { DateEx } from "../../model/DateEx";

export declare namespace IDateTimePicker {

    interface Event {
        id: number;
        user_id?: number;
        title: string;
        message: string;
        createdAt?: string;
        updatedAt?: string;
    }

    type ViewMode = 'day' | 'month' | 'year' | 'yearStack';
    type PickerMode = 'time' | 'date' | 'both';

    interface Store { 
        pickerMode: PickerMode;
        viewMode: IDateTimePicker.ViewMode;
        selectedDate: DateEx;
    }
    
    interface Config {
        element?: HTMLElement;
        title?: string;
        value: DateEx;
        pickerMode?: PickerMode;
        viewMode?: ViewMode;
        language?: string;
        minDate: string;
        maxDate: string;
        onSelect: (selectedDate: DateEx) => void;
        onClose: () => void;
        onCancel: () => void;
        getTitle?: (viewMode: ViewMode, dateInfo: DateInfo) => string;
    }

    interface DateMap {
        className: string;
        date: string;
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