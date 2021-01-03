import { JSX } from '@stencil/core';
import FSObject from '../../model/FSObject';

export declare namespace ISlider {

    type IVariant = 'image' | 'youtube';

    interface Config {
        ratio?: string;
        callback?: (item: FSObject) => void;
        itemRender?: (state: FSObject) => JSX.Element;
        index?: number;
        items: FSObject[];
        variant?: IVariant;
    }    

    interface Props {
        ratio?: '16:9' | string,
        counter?: any;
        idx?: number;
        items: FSObject[];
        style?: string;
        variant?: IVariant;
        callback?: (item: FSObject) => void;
        renderItem?: (state: State) => JSX.Element;
    }
    
    interface InternalState {
        ref: HTMLElement | null;
        idx: number;
    }

    type State = InternalState & Props;
}
