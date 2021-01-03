import { Type } from "../util/classTransform";
import { DateEx } from "./DateEx";

export type Id = string;

export interface IBaseEntity<T> {
    $pending?: boolean;
    $new?: boolean;
    $timestamp?: number;
    $original?: T;
    $deleted?: boolean;
    
    id?: Id;
    createdAt?: DateEx;
    createdBy?: string;
    updatedAt?: DateEx;
    updatedBy?: string;

    clone: () => this;
    toJSON: () => this;
}

export class BaseEntity<T> implements IBaseEntity<T> {
    public $pending?: boolean;
    public $new?: boolean;
    public $timestamp?: number;
    public $original?: T;
    public $deleted?: boolean;
    
    public id?: Id;
    @Type(() => DateEx)
    public createdAt?: DateEx;
    public createdBy?: string;
    @Type(() => DateEx)
    public updatedAt?: DateEx;
    public updatedBy?: string;

    constructor(initValues?: Partial<T>) {
        if (initValues) {
            Object.entries(initValues).forEach(([key, value]) => this[key] = value);
        }

    }

    public clone(): this {
        const obj = this;
        const copy = new (this as any).constructor();
        for (let attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy
    }

    public toJSON(): this {
        const data = Object.assign({}, this);

        Object.entries(data).forEach(([key, value]) => {
            if (typeof value === 'function' || key.startsWith('$')) {
                delete data[key];
            }
        });

        const serializedData = JSON.parse(JSON.stringify(data)) as typeof data;
        return serializedData;
    }
}
