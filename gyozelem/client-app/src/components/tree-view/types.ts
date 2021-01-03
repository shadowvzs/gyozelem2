import { IHierarchyMap, ITreeObject, TreeKey } from "../../util/core";
import { JSX } from '@stencil/core';

export declare namespace ITreeView {

    export interface Config<T = any> {
        renderItem: (item: T, isActive?: boolean) => JSX.Element;
        getId: (item: T) => TreeKey;
        getParentId: (item: T) => TreeKey;
        getRootItem: () => T;
        onSelect: (id: TreeKey) => void;
        isEnabled?: (item: T) => boolean;

        rootId: TreeKey;
        activeId: TreeKey;
        list: T[];
    }
    
    interface State<T = any> {
        treeMap: IHierarchyMap<ITreeObject<T>>;
    }
}