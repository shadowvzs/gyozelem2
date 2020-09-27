import { IArrayValueMap } from "../../../core/util/core";
import FSObject from '../model/FSObject';

export declare namespace IFileExplorer {

    interface State {
        activeId: string;
        list: FSObject[];
        mappedList?: IArrayValueMap<FSObject>;
        sort: [keyof FSObject, 'ASC' | 'DESC'];
    }

}
