import { globalStore } from "../global/stores";

export const navigateTo = (url: string) => {
    const store = globalStore.get('history');
    if (store) {
        store.replace(url);
    }
}

export const classAutobind = (t: any, exclude: string[] = []) => {
    const prototype = t.constructor.prototype;
    Object.getOwnPropertyNames(prototype)
        .filter((key) => (typeof prototype[key] === 'function') && key !== 'constructor')
        .filter((key) => !~exclude.indexOf(key))
        .forEach((key) => t[key] = t[key].bind(t));
}

export const guid = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: string) => {
        const r: number = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export const delay = (sec: number): Promise<number> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(sec), sec * 1000);
    });
}

type IValueMap<T> = Record<string, T>;

export interface IArrayValueMap<T = any> extends Array<T> {
    [key: number]: T;
    valueMap: IValueMap<T>;
    length: number;
    push: (arg0: T) => number;
    add: (arg0: T) => void;
    remove: (arg0: string | number, arg1?: (string | number)[]) => (string | number)[];
    splice: (arg0: number, arg1: number, arg2?: T) => T[];
}

export interface IHierarchyMap<T = any> extends IArrayValueMap<T> {
    getParentIds: (itemId: TreeKey, until?: TreeKey) => TreeKey[];
    getParents: (itemId: TreeKey, until?: TreeKey) => T[];
    getChilds: (itemId: TreeKey) => T[];
    getChildIds: (itemId: TreeKey) => TreeKey[];
}

export const arrayToMap = (array: string[]): Record<string, string|number> => {
    const obj: Record<string, string|number> = {};
    array.forEach((x: string, i: number) => {
        obj[x] = i;
        obj[i] = x;
    });
    return obj;
}

export function array2ArrayMap<T>(data: T[] = [], key: string = 'id'): IArrayValueMap<T> {
    const result = new Array() as unknown as IArrayValueMap<T>;
    result.length = data.length;
    result.valueMap = {};
    data.forEach((x, i) => {
        result[i] = x;
        result.valueMap[x[key]] = x;
    });
    result.add = function(item: T) {
        result.push(item);
        result.valueMap[item[key]] = item;
    }
    result.remove = function(id: string | number) {
        result.splice(result.findIndex(x => x[key] === id), 1);
        delete result.valueMap[id];
        return [id] as (string | number)[];
    }    
    return result;
}

export interface ITreeObject<T> {
    id: number | string;
    parent: ITreeObject<T>;
    childs: ITreeObject<T>[];
    item: T;
}

export type TreeKey = number | string;

export const TREE_ROOT_ID = '-1';
export function array2Hierarchy<T>(data: T[] = [], getId: (item: T) => TreeKey, getParentId: (item: T) => TreeKey, rootItem: T): IHierarchyMap<ITreeObject<T>> {
    const result = new Array() as unknown as IHierarchyMap<ITreeObject<T>>;
    result.valueMap = {};

    result.add = function (item: ITreeObject<T>) {
        this.push(item);
        this.valueMap[item.id] = item;
        if (item.parent) {
            item.parent.childs.push(item)
        }
    };

    result.remove = function(id: TreeKey, childIds?: TreeKey[]) {
        const rootItem: ITreeObject<T> = this.valueMap[id];
        if (rootItem.parent) {
            rootItem.parent.childs = rootItem.parent.childs.filter(x => x.id !== id);
        }
        const ids: TreeKey[] = childIds || result.getChildIds(id);
        const m = result.length - 1;
        let item: ITreeObject<T>;
        for (let i = m; i >= 0; i--) {
            item = this[i];
            if (~ids.indexOf(item.id)) {
                if (item.parent?.childs) {
                    const cIdx = item.parent?.childs.findIndex(x => ids.includes(x.id));
                    if (cIdx) { item.parent.childs.splice(cIdx, 1); }
                }
                delete this.valueMap[item.id];
                this.splice(i, 1);
            }
        }

        
        /*
        const m = result.length - 1;
        for (let i = m; i >= 0; i--) {
            if (~ids.indexOf(this[i].id)) {
                this.valueMap.remove(this[i].id);
                this.splice(i, 1);
            }
        }
        */
        return ids;
    }

    data.forEach((x) => {
        const id = getId(x);
        result.add({
            id: id,
            parent: null,
            childs: [],            
            item: x
        });
    });

    const root = {
        id: '00000000-0000-0000-0000-000000000000',
        parent: null,
        childs: [],
        item: rootItem
    };

    result.forEach(x => {
        
        const parentId = getParentId(x.item);
        
        if (parentId === root.id) { 
            x.parent = root;
            return root.childs.push(x);
        } else if (!parentId) {
            return;
        }

        const parent = result.valueMap[parentId];
        parent.childs.push(x);
        x.parent = parent;
    });

    result.valueMap[(rootItem as any).id] = root;

    result.getParentIds = (itemId: TreeKey, until?: TreeKey): TreeKey[] => {
        return result.getParents(itemId, until).map(x => getId(x.item));
    }

    result.getParents = (itemId: TreeKey, until?: TreeKey): ITreeObject<T>[] => {
        const parents: ITreeObject<T>[] = [];
        let item = result.valueMap[itemId];
        let id: TreeKey;
        while (item) {
            id = getId(item.item);
            if (id === until) { break; }
            if (itemId !== id) {
                parents.push(item);                
            }
            item = item.parent;
        };
        return parents;
    };

    result.getChildIds = (itemId: TreeKey): TreeKey[] => {
        const item = result.valueMap[itemId];
        if (!item) { return; }
        const keys: TreeKey[] = []
        keys.push(getId(item.item));
        item.childs.forEach(x => {
            keys.push(...result.getChildIds(x.id));
        });
        return keys;
    }

    result.getChilds = (itemId: TreeKey): ITreeObject<T>[] => {
        return result.getChildIds(itemId).map(x => result.valueMap[x]).filter(Boolean);
    };

    return result;
}

export const betweenNr = (value: number, [min, max]: [number, number]) => {
    return Math.max(Math.min(value, max), min);
}

export const capitalize = (t: string) => t[0].toUpperCase() + t.substr(1);
// dash to capitalized word
export const d2capitalize = (t: string) => t.replace(/(^|\-)./g, s => s.slice(-1).toUpperCase());
// underscore to capitalized word
export const u2capitalize = (t: string) => t.replace(/(^|_)./g, s => s.slice(-1).toUpperCase());
// 
export const c2dashed = (x: string): string => x.replace(/[A-Z]/g, m => "-" + m.toLowerCase());

export function getDeepProp(obj: Record<string, any> = {}, keys: string = '', fallback?: any): any {
    const key = keys.split('.');
    const max = key.length;
    let i = 0;
    for (; i < max && obj; i++) obj = obj[key[i]];
    return i === max && obj ? obj : fallback;
}

export const sort = <T>(list: T[], key: keyof T, direction: 'ASC' | 'DESC' = 'ASC'): T[] => {
    return list.sort((a, b) => (a && b) ? (a[key] > b[key] ? 1 : -1) * (direction === 'ASC' ? 1 : -1) : 0);
}

export function deepClone<T = any>(source: T): T {
    let outObject: T;

    if (typeof source !== "object" || source === null) {
        return source;
    }

    outObject = (Array.isArray(source) ? [] : {}) as T;
  
    for (let key in source) {
        outObject[key] = deepClone(source[key]);
    }
  
    return outObject;
}

export function getPath<T>(items: IArrayValueMap<ITreeObject<T>>, activeId: TreeKey, rootId: TreeKey = TREE_ROOT_ID) {
    const ids: TreeKey[] = [];
    let parent: ITreeObject<T>;

    while (items.valueMap[activeId] && rootId !== activeId) {
        ids.push(activeId);

        parent = items.valueMap[activeId].parent;
        activeId = parent ? parent.id : null;
    }

    return ids;
}
