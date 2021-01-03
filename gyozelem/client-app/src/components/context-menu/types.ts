export declare namespace IContextMenu {

    type WithString<T> = string | ((item: T) => string);
    
    interface Menu<T> {
        icon?: WithString<T>;
        label: WithString<T>;
        action: (event: MouseEvent, item: T, data?: any) => void;
        enable?: (item: T, data?: any, event?: MouseEvent) => boolean;
        visible?: (item: T, data?: any, event?: MouseEvent) => boolean;
    }

    interface Config<T, P = any> {
        item: T,
        event: MouseEvent,
        menu: Menu<T>[];
        data?: P;
    }
  
    type ActionTypes = 
        'create' |
        'upload' |
        'duplicate' |
        'delete' |
        'download'
    ;

    interface Action<T = any> {
        action: (item: T, data?: any) => void;
        icon?: string | ((item: T, data?: any) => string);
        label?: string | ((item: T, data?: any) => string);
        visible?: boolean | ((item: T, data?: any) => boolean);
        enable?: boolean | ((item: T, data?: any) => boolean);
    }

    type Actions<T = any> = Record<ActionTypes, Action<T>>;
}