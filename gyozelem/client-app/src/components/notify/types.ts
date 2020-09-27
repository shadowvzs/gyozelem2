export interface IMessage {
    closeClass: string;
    message: string;
    onTransitionEnd: (event: TransitionEvent) => void;
    type: string; 
}

export type IAvaliableNotifyTypes = 'success' | 'error' | 'warning' | 'normal';
