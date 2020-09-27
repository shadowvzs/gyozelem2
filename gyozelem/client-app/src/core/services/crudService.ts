import { createStore } from "@stencil/store";
import { IBaseEntity, Id } from '../model/BaseEntity';
import { request } from './request';
import { ICrudService } from "./type";

const defaultEndpoints: ICrudService.Endpoints = {
    get:        { method: 'GET'    },
    create:     { method: 'POST'   },
    update:     { method: 'PUT'    },
    delete:     { method: 'DELETE' },
    getList:    { method: 'GET',  suffix: 'list'       },
    bulkCreate: { method: 'POST', suffix: 'bulkCreate' },
    bulkUpdate: { method: 'POST', suffix: 'bulkUpdate' },
    bulkDelete: { method: 'POST', suffix: 'bulkDelete' }
};

export class CrudService<T extends IBaseEntity<T>> {
    public static cacheMap = createStore<ICrudService.ICacheMap>({});
    public get items() { return this._store.get('list'); }
    public set items(items: T[]) { this._store.set('list', items); }
    public get totalCount() { return this._store.get('totalCount'); }
    public set totalCount(nr: number) { this._store.set('totalCount', nr); }
    protected name: string;
    private _endpoints: ICrudService.Endpoints = defaultEndpoints;
    private _store = createStore<ICrudService.Store<T>>({
        list: [],
        isLoading: false,
        totalCount: 0,
        selectedIds: [],
        sortKey: 'createdAt',
        sortDirection: 'DESC'
    });

    constructor(
        private _classType: Function, 
        endpoints: ICrudService.Endpoints | string
    ) {
        this.generateEndpoints(endpoints);

        this.name = _classType?.name;
        if (this.name && !CrudService.cacheMap[this.name]) {
            CrudService.cacheMap.set(this.name, {});
        }
        this.save = this.save.bind(this);

        window['itemCache'] = CrudService.cacheMap[this.name]
        window['service'+this.name] = this
        window['test'] = () => this.cache

    }

    public get selectedIds(): Id[] {
        return this._store.get('selectedIds');
    }

    public set selectedIds(ids: Id[]) {
        this._store.set('selectedIds', ids);
    }
    
    private get cache(): Record<string, T> {
        return CrudService.cacheMap.get(this.name);
    }

    private set cache(entities: Record<string, T>) {
        CrudService.cacheMap.set(this.name, entities);
    }

    private generateEndpoints(endpoints: ICrudService.Endpoints | string) {
        if (typeof endpoints === 'string') {
            Object.entries(this._endpoints).forEach(([key]) => {
                if (this._endpoints[key]) { 
                    this._endpoints[key].url = endpoints; 
                }
            })

            Object.keys(this._endpoints)
                .filter(k => !this._endpoints[k] || !this._endpoints[k].suffix)
                .forEach(k => {
                    const e = this._endpoints[k];
                    if (!e || !e.suffix) { return; }
                    e.url = [...e.url.split('/'), e.suffix].join('/');
                });
        } else {
            Object.entries(endpoints).forEach(([key, value]) => {
                if (this._endpoints[key]) { this._endpoints[key] = { ...this._endpoints[key], ...value }; }
            })
        }
    }

    //#region Crud Actions - simple
    public getPromise = async (id: Id, filters: Record<string, string | number | boolean> = {}): Promise<T> => {
        this._store.set('isLoading', true);
        const params = { id, ...filters };
        const response = await request.send<T>(this._endpoints.get.url, { data: params, method: 'GET' });
        this._store.set('isLoading', false);
        return this.receive(response.data, true);
    }

    public save (item: T): Promise<T> {
        return item.id ? this.updatePromise(item) : this.createPromise(item);
    }

    public createPromise = async (data: T): Promise<T> => {
        const response = await request.send<T>(this._endpoints.create.url, { data, method: 'POST' });
        const item = this.receive(response.data, true);
        item.$new = true;
        return item;
    }

    public updatePromise = async (data: T): Promise<T> => {
        const oldItem = this.getCacheItem(data.id);
        let clonedItem: T;
        if (oldItem) { clonedItem = this.deserialize(this.serialize(clonedItem)); }
        const response = await request.send<T>(this._endpoints.update.url, { data, method: 'PUT' });
        const item = this.receive(response.data, true);

        if (clonedItem) { item.$original = clonedItem; }
        item.$new = false;
        return item;
    }

    public deletePromise = async (id: Id): Promise<void> => {
        await request.send<T>(this._endpoints.update.url, { data: { id }, method: 'DELETE' });
        this.removeCacheItem(id);
    }
    //#endregion

    //#region Crud Actions - bulk
    public getList = async (filters: Record<string, string | boolean | number> = {}, config: ICrudService.GetListFilter<T> = {}): Promise<ICrudService.Pagination<T>> => {
        this._store.set('isLoading', true);
        if (!config.sortKey) { config.sortKey = this._store.get('sortKey'); }
        if (!config.sortDirection) { config.sortDirection = this._store.get('sortDirection'); }
        const params = { ...config, ...filters };
        const response = await request.send<ICrudService.Pagination<T>>(this._endpoints.getList.url, { data: params, method: 'GET' });
        this.items = response.data.items.map(x => this.receive(x));
        this.totalCount = response.data.total;
        this.setCacheItems(this.items);
        this._store.set('isLoading', false);
        this._store.set('totalCount', response.data.total);
        return { ...response.data, items: this.items };
    }
    //#endregion

    //#region cache related functions
    public getCacheItem = (id: Id, fallback?: T): T => {
        return this.cache ? this.cache[id] : fallback;
    }

    public addCacheItem = (data: T): T => {
        console.log(!this.cache, data)
        if (!this.cache) { return data; }
        const id = data.id;
        const item: T = { ...(this.cache[id] ?? {}), ...(data ?? {}) } as T;
        this.cache[id] = item;
        return item;
    }

    private setCacheItems = (list: T[], clearCache?: boolean): void => {
        if (!this.cache) { return; }
        const itemMap = list.reduce((obj, item) => {
            obj[item.id] = item;
            return obj;
        }, {});
        this.cache = clearCache ? itemMap : Object.assign(this.cache, itemMap);
    }

    private removeCacheItem = (id: Id): void => {
        const cache = this.cache;
        if (!cache) { return; }
        delete cache[id];
        this.cache = cache;
    }
    //#endregion

    //#region serialization
    private receive = (data: T, received?: boolean): T => {
        const item = this.deserialize(data);
        if (received) { item.$timestamp = Date.now(); }
        return this.addCacheItem(item);
    }

    private serialize = (data: T): T => {
        const serializedData = data.toJSON ? data.toJSON() : data;
        return serializedData;
    }

    private deserialize = (data: T): T => {
        const inst = this._classType as any;
        if (data.clone) {
            data = this.serialize(data);
        }
        
        const newInstance: T = new inst() as T;
        Object.keys(data).forEach(k => newInstance[k] = data[k])
        return newInstance;
    }
    //#endregion

    //#region select
    public get selectedItems(): T[] {
        const selectedIds = this.selectedIds;
        const items = this.items;
        return selectedIds.filter(id => id && items[id]).map(id =>items[id]);
    }

    public select = (id: Id): void => {
        const selectedIds = this.selectedIds.filter(x => x !== id);
        selectedIds.push(id);
        this.selectedIds = selectedIds;
    }

    public unSelect = (id: Id): void => {
        this.selectedIds = this.selectedIds.filter(x => x !== id);
    }

    public toggleSelect = (id: Id): void => {
        this[this.isSelected(id) ? 'unSelect' : 'select'](id);
    }

    public isSelected = (id: Id): boolean => {
        return this.selectedIds.includes(id);
    }

    public selectAll = () => {
        this.selectedIds = this.items.map(x => x.id);
    }

    public unSelectAll = () => {
        this.selectedIds = [];
    }
    //#endregion 

    public dispose = () => {
        this._endpoints = null;
        this._store.dispose();
    }
}
