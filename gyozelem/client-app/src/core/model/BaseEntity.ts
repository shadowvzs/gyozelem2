export type Id = string;

export interface IBaseEntity<T> {
    $pending?: boolean;
    $new?: boolean;
    $timestamp?: number;
    $original?: T;
    
    id?: Id;
    createdAt?: Date;
    createdBy?: string;
    updatedAt?: Date;
    updatedBy?: string;

    clone: () => this;
    toJSON: () => this;
}

export class BaseEntity<T> implements IBaseEntity<T> {
    public $pending?: boolean;
    public $new?: boolean;
    public $timestamp?: number;
    public $original?: T;
    
    public id?: Id;
    public createdAt?: Date;
    public createdBy?: string;
    public updatedAt?: Date;
    public updatedBy?: string;

    constructor(initValues?: Partial<T>) {
        if (initValues) {
            Object.entries(initValues).forEach(([key, value]) => this[key] = value);
        }
    }

    public clone = (): this => {
        const obj = this;
        const copy = this.constructor();
        for (let attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy
    }

    public toJSON = (): this => {
        const data = Object.assign({}, this);

        Object.entries(data).forEach(([key, value]) => {
            if (typeof value === 'function') {
                delete data[key];
            }
        });

        const serializedData = JSON.parse(JSON.stringify(data)) as typeof data;
        Object.keys(serializedData)
            .filter(k => k.startsWith('$'))
            .forEach(k => delete serializedData[k]);
        return serializedData;
    }
}
