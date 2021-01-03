import { DateEx } from "../model/DateEx";
import { objFor } from "./performance";

const typeSymbol = Symbol('type');
type TypeRecord<T = Object> = Record<string, Date | T>;

function getBaseTypes<T extends Object>(objInstance: T, types: TypeRecord = {}) {
    const constructor = objInstance.constructor;
    if (constructor[typeSymbol]) {
        objFor<Record<string, any>>(constructor[typeSymbol], (key, value) => {
            types[key] = value;
        });
    }
    
    const base = Object.getPrototypeOf(constructor);
    if (base.name) {
        return getBaseTypes(base, types);
    }
    return types;
}

export const plainToClass = <T = any>(entity: Partial<T>, ClassType: new () => T): T => {
    const instance = new ClassType();
    objFor<Record<string, any>>(entity, (key, value) => {
        const types = getBaseTypes(instance);
        if (value === null) { return; }
        if (types && types[key]) {
            const SubType = types[key];
            if (SubType === DateEx) {
                if (typeof value === "string") {
                    const newDate = Date.parse(value);
                    if (isNaN(newDate) || newDate < 0) { return; }
                    value = new DateEx(value);                
                }
            } else if (SubType === Date) {
                if (typeof value === "string") {
                    const newDate = Date.parse(value);
                    if (isNaN(newDate) || newDate < 0) { return; }
                    value = new Date(value);                
                }                
            } else if (SubType.prototype) {
                if (Array.isArray(value)) {
                    value = value.map(x => plainToClass<typeof SubType>(x, SubType));
                } else {
                    value = plainToClass<typeof SubType>(value, SubType);
                }
            }
        }
        (instance as any)[key] = value;
        
    });
    return instance;
}

export function Type<T extends Object>(cb: () => T) {
    return function<P extends Object>(target: P, property: string) {
        const types = target.constructor[typeSymbol] || {}
        types[property] = cb();
        target.constructor[typeSymbol] = types;
    };
}

