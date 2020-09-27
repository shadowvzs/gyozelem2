import { JSX } from '@stencil/core';

export declare namespace ISlider {

    interface Item extends Record<string, any> {
        url: string;
        description?: string;
    }

    type IVariant = 'image' | 'youtube';

    interface Props {
        ratio?: '16:9' | string,
        counter?: any;
        idx?: number;
        items: Item[];
        style?: string;
        variant?: IVariant;
        callback?: (item: Item) => void;
        renderItem?: (state: State) => JSX.Element;
    }
    
    interface InternalState {
        ref: HTMLElement | null;
        idx: number;
    }

    type State = InternalState & Props;
}
