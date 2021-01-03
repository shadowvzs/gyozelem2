import { Id } from "../model/BaseEntity";

export declare namespace ICrudService {

    type EntityCache<T> = Record<string, T>;
    type ICacheMap<T = any> = Record<string, EntityCache<T>>;
    type ListParams<T> = Record<string, number | string | boolean> & ICrudService.GetListFilter<T>;

    interface Config {
        noCache?: boolean;
        noList?: boolean;
    }

    interface SignalRFeedback<T = any> {
        name: string;
        type: "Added" | "Deleted" | "Detached" | "Modified" | "Unchanged";
        entity: T;
    }

    interface Endpoint {
        method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
        url?: string;
        suffix?: string;
    }

    interface Store<T> {
        isLoading: boolean;
        list: T[];
        selectedIds: Id[];
        totalCount: number;
        sortKey: keyof T;
        sortDirection: 'ASC' | 'DESC';
    }

    interface GetListFilter<T>  {
        offset?: number;
        limit?: number;
        sortKey?: keyof T;
        sortDirection?: 'ASC' | 'DESC';
    }

    interface Pagination<T> {
        limit?: number;
        offset?: number;
        total?: number;
        items?: T[];
    }

    type EndpointType = 'get' | 'create' | 'update' | 'delete' | 'getList' | 'bulkCreate' | 'bulkUpdate' | 'bulkDelete';

    type Endpoints = Record<EndpointType, Endpoint>;
    
}

export interface HTMLComponent<T> extends HTMLElement {
    service?: T;
}