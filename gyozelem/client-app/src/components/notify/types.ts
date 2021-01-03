export declare namespace INotify {
    interface Message {
        closeClass: string;
        message: string;
        onTransitionEnd: (event: TransitionEvent) => void;
        type: string; 
    }

    type Types = 'success' | 'error' | 'warning' | 'normal';
}