import { createStore } from "@stencil/store";
import { broadcast, ISignalREntity } from "../global/Broadcast";
import { IBaseEntity, Id } from '../model/BaseEntity';
import { plainToClass } from "../util/classTransform";
import { request } from './request';
import { ICrudService } from "./type";

const getDefaultEndpoints: () => ICrudService.Endpoints = () => ({
    get:        { method: 'GET'    },
    create:     { method: 'POST'   },
    update:     { method: 'PUT'    },
    delete:     { method: 'DELETE' },
    getList:    { method: 'GET',  suffix: 'list'       },
    bulkCreate: { method: 'POST', suffix: 'bulkCreate' },
    bulkUpdate: { method: 'POST', suffix: 'bulkUpdate' },
    bulkDelete: { method: 'POST', suffix: 'bulkDelete' }
});

export class CrudService<T extends IBaseEntity<T>> {

    public static cacheMap = createStore<ICrudService.ICacheMap>({});

    // need added/modified/ deleted subscription
    // private subscriptionMap: Map<Function, 

    public get items() { return this._store.get('list'); }
    public set items(items: T[]) { this._store.set('list', items); }
    public get totalCount() { return this._store.get('totalCount'); }
    public set totalCount(nr: number) { this._store.set('totalCount', nr); }
    public request = request;
    public sortEnabled: boolean = true;

    protected name: string;

    private _endpoints: ICrudService.Endpoints;
    private _store = createStore<ICrudService.Store<T>>({
        list: [],
        isLoading: false,
        totalCount: 0,
        selectedIds: [],
        sortKey: 'createdAt',
        sortDirection: 'DESC'
    });

    protected _signalRSubscription: { unsubscribe: () => void; };

    constructor(
        private _classType: ((new () => T) & { _name: string }),
        endpoints: ICrudService.Endpoints | string
    ) {
        this.generateEndpoints(endpoints);

        // bind methods
        this.wasAdded = this.wasAdded.bind(this);
        this.wasModified = this.wasModified.bind(this);
        this.wasDeleted = this.wasDeleted.bind(this);

        this.getPromise = this.getPromise.bind(this);
        this.savePromise = this.savePromise.bind(this);
        this.createPromise = this.createPromise.bind(this);
        this.updatePromise = this.updatePromise.bind(this);
        this.deletePromise = this.deletePromise.bind(this);
        this.getList = this.getList.bind(this);
        this.getCacheItem = this.getCacheItem.bind(this);
        this.addCacheItem = this.addCacheItem.bind(this);
        this.select = this.select.bind(this);
        this.unSelect = this.unSelect.bind(this);
        this.toggleSelect = this.toggleSelect.bind(this);
        this.isSelected = this.isSelected.bind(this);
        this.selectAll = this.selectAll.bind(this);
        this.unSelectAll = this.unSelectAll.bind(this);
        this.signalRHandler = this.signalRHandler.bind(this);

        this.name = _classType?._name;
        if (this.name && !CrudService.cacheMap[this.name]) {
            CrudService.cacheMap.set(this.name, {});
        }

        if (this.name) {
            this._signalRSubscription = broadcast.on('signalr:' + this.name, this.signalRHandler);
        }

        window['itemCache'] = CrudService.cacheMap[this.name]
    }

    // --- SIGNALR callbacks --- 

    private signalRHandler(rawJson: string) {
        const data: ISignalREntity<T> = JSON.parse(rawJson);
        const entity = plainToClass(data.entity, this._classType);
        const handlerName = `was${data.state[0] + data.state.substr(1)}`;
        if (this[handlerName]) {
            this[handlerName](entity);
        }
    }

    public wasAdded(entity: T): void {
        const item = this.receive(entity, true);
        this.items = [...this.items, item];
        this.afterAdded(entity);
    }

    public wasModified(entity: T): void {
        const updatedItem = this.receive(entity, true);
        this.items = [...this.items];
        this.afterModified(updatedItem);
    }


    public wasDeleted(entity: T): void {
        const item = this.items.find(x => x.id === entity.id);
        item.$deleted = true;
        this.items = this.items.filter(x => x.id !== entity.id);
        this.afterDeleted(entity);
    }

    public afterAdded(entity: T): void {
        console.info('was added', entity);
    }

    public afterModified(entity: T): void {
        console.info('was modified', entity);
    }

    public afterDeleted(entity: T): void {
        console.info('was deleted', entity);
    }

    // -----------------------

    public get isLoading() {
        return this._store.get('isLoading');
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
        const _endpoints = getDefaultEndpoints(); 

        if (typeof endpoints === 'string') {
            Object.entries(_endpoints).forEach(([key]) => {
                if (_endpoints[key]) { 
                    _endpoints[key].url = endpoints; 
                }
            })

            Object.keys(_endpoints)
                .filter(k => !_endpoints[k] || !_endpoints[k].suffix)
                .forEach(k => {
                    const e = _endpoints[k];
                    if (!e || !e.suffix) { return; }
                    e.url = [...e.url.split('/'), e.suffix].join('/');
                });
        } else {
            Object.entries(endpoints).forEach(([key, value]) => {
                if (_endpoints[key]) { _endpoints[key] = { ..._endpoints[key], ...value }; }
            })
        }
        this._endpoints = _endpoints;
    }

    //#region Crud Actions - simple
    public async getPromise(id: Id, filters: Record<string, string | number | boolean> = {}): Promise<T> {
        this._store.set('isLoading', true);
        const params = { id, ...filters };
        const response = await this.request.send<T>(this._endpoints.get.url, { data: params, method: 'GET' });
        this._store.set('isLoading', false);
        return this.receive(response.data, true);
    }

    public savePromise(item: T): Promise<T> {
        return item.id ? this.updatePromise(item) : this.createPromise(item);
    }

    public async createPromise<P = T>(data: P): Promise<T> {
        const response = await this.request.send<T>(this._endpoints.create.url, { data, method: 'POST' });
        const item = this.receive(response.data, true);
        item.$new = true;
        return item;
    }

    public async updatePromise(data: T): Promise<T> {
        const oldItem = this.getCacheItem(data.id);
        let clonedItem: T;
        if (oldItem) { clonedItem = this.deserialize(this.serialize(data)); }
        const response = await this.request.send<T>(this._endpoints.update.url + '/' + data.id, { data, method: 'PUT' });
        const item = this.receive(response.data, true);

        if (clonedItem) { item.$original = clonedItem; }
        item.$new = false;
        return item;
    }

    public async bulkUpdatePromise(items: T[]): Promise<T[]> {
        await this.request.send<T>(this._endpoints.update.url, { method: 'PUT', data: items });
        return items;
    }

    public async deletePromise(id: Id): Promise<void> {
        await this.request.send<T>(this._endpoints.update.url + '/' + id, { method: 'DELETE' });
        this.removeCacheItem(id);
    }

    public async bulkDeletePromise(ids: Id[]): Promise<void> {
        await this.request.send<T>(this._endpoints.update.url, { method: 'DELETE', data: ids });
        ids.forEach(id => this.removeCacheItem(id));
    }
    //#endregion

    //#region Crud Actions - bulk
    public async getList(params: ICrudService.ListParams<T> = {}, config: ICrudService.Config = {}): Promise<ICrudService.Pagination<T>> {
        this._store.set('isLoading', true);
        if (!params.sortKey && this.sortEnabled) { params.sortKey = this._store.get('sortKey'); }
        if (!params.sortDirection && this.sortEnabled) { params.sortDirection = this._store.get('sortDirection'); }
        const response = await this.request.send<ICrudService.Pagination<T>>(this._endpoints.getList.url, { data: params, method: 'GET' });
        const items = response.data.items.map(x => this.receive(x));
        if (!config.noList) {
            this.items = items;
        }        
        this.totalCount = response.data.total;
        if (!config.noCache) {
            this.setCacheItems(items);
        }
        this._store.set('isLoading', false);
        this._store.set('totalCount', response.data.total);
        return { ...response.data, items: items };
    }
    //#endregion

    //#region cache related functions
    public getCacheItem(id: Id, fallback?: T): T {
        return this.cache ? this.cache[id] : fallback;
    }

    public addCacheItem(data: T): T {
        if (!this.cache) { return data; }
        const id = data.id;
        if (this.cache[id]) {
            data = Object.assign(this.cache[id], data)
        } else if (!data.toJSON) {
            data = plainToClass({...data}, this._classType);
        }
        this.cache[id] = data;
        return data;
    }

    private setCacheItems(list: T[], clearCache?: boolean): void {
        if (!this.cache) { return; }
        const itemMap = list.reduce((obj, item) => {
            obj[item.id] = item;
            return obj;
        }, {});
        this.cache = clearCache ? itemMap : Object.assign(this.cache, itemMap);
    }

    private removeCacheItem(id: Id): void {
        const cache = this.cache;
        if (!cache) { return; }
        delete cache[id];
        this.cache = cache;
    }
    //#endregion

    //#region serialization
    private receive(data: T, received?: boolean): T {
        let item = this.deserialize(data);
        if (received) { item.$timestamp = Date.now(); }
        return this.addCacheItem(item);
    }

    public serialize(data: T): T {
        const serializedData = data.toJSON ? data.toJSON() : data;
        return serializedData;
    }

    public deserialize(data: T): T {
        if (data.toJSON) {
            return data;
        }
        return plainToClass(data, this._classType);
    }
    //#endregion

    //#region select
    public get selectedItems(): T[] {
        const selectedIds = this.selectedIds;
        return selectedIds.map(id => this.getCacheItem(id));
    }

    public select(id: Id): void {
        const selectedIds = this.selectedIds.filter(x => x !== id);
        selectedIds.push(id);
        this.selectedIds = selectedIds;
    }

    public unSelect(id: Id): void {
        this.selectedIds = this.selectedIds.filter(x => x !== id);
    }

    public toggleSelect(id: Id): void {
        this[this.isSelected(id) ? 'unSelect' : 'select'](id);
    }

    public isSelected(id: Id): boolean {
        return this.selectedIds.includes(id);
    }

    public selectAll() {
        this.selectedIds = this.items.map(x => x.id);
    }

    public unSelectAll() {
        this.selectedIds = [];
    }

    //#endregion 
    public dispose() {
        this._endpoints = null;
        this._signalRSubscription.unsubscribe();
        this._store.dispose();
    }
}
