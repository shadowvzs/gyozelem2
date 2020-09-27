export declare namespace IContextMenu {
    interface Menu<T> {
        data: T;
        label: string;
        callback: (data: T, event: MouseEvent) => void;
    }
    
    interface EventDetail<T> {
        target: HTMLElement;
        x: number;
        y: number;
        menu: Menu<T>[]; 
    }
    
    interface ContextMenuEvent<T> extends Event {
        detail: EventDetail<T>;
    }
}