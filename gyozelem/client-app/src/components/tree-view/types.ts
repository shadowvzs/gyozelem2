import { IArrayValueMap, ITreeObject, TreeKey } from "../../core/util/core";
import { JSX } from '@stencil/core';

export declare namespace ITreeView {

    export interface Config<T = any> {
        renderItem: (item: T, isActive?: boolean) => JSX.Element;
        getId: (item: T) => TreeKey;
        getParentId: (item: T) => TreeKey;
        getRootItem: () => T;
        onSelect: (id: TreeKey) => void;

        rootId: TreeKey;
        activeId: TreeKey;
        list: T[];
    }
    
    interface State<T = any> {
        treeMap: IArrayValueMap<ITreeObject<T>>;
    }
}