import { IValidatorData, IValidatorOption, ValidationCondition, IVCondition, IBaseModel, IDecoratorSignature } from "../components/form-validator/types";
import { getDeepProp } from "./core";


export const validatorData: IValidatorData = {
    TYPE: {
        EMAIL: (x: string) => new RegExp('^([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$)$').test(x),
        NAME_HUN: (x: string) => new RegExp('^([a-zA-Z0-9 ÁÉÍÓÖŐÚÜŰÔ??áéíóöőúüűô??]+)$').test(x),
        ADDRESS_HUN: (x: string) => new RegExp('^([a-zA-Z0-9 ÁÉÍÓÖŐÚÜŰÔ??áéíóöőúüűô??\,\.\-]+)$').test(x),
        NAME: (x: string) => new RegExp('^([a-zA-Z0-9 \-]+)$').test(x),
        INTEGER: (x: string) => new RegExp('^([0-9]+)$').test(x),
        SLUG: (x: string) => new RegExp('^[a-zA-Z0-9-_]+$').test(x),
        URL: (x: string) => new RegExp('^[a-zA-Z0-9-_]+$').test(x),
        ALPHA_NUM: (x: string) => new RegExp('^([a-zA-Z0-9]+)$').test(x),
        STR_AND_NUM: (x: string) => new RegExp('^([0-9]+[a-zA-Z]+|[a-zA-Z]+[0-9]+|[a-zA-Z]+[0-9]+[a-zA-Z]+)$').test(x),
        LOWER_UPPER_NUM: (x: string) => (/^(?=.*[A-Z])(?=.*[a-z])(?=.*[\d])([A-Za-z\d]{6,})$/).test(x),
        LOWER_UPPER_NUM_SYMBOL: (x: string) => (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/).test(x),
        MYSQL_DATE: (x: string) => new RegExp('^([0-9]{2,4})-([0-1][0-9])-([0-3][0-9])(?:( [0-2][0-9]):([0-5][0-9]):([0-5][0-9]))?$').test(x),
        STRING: () => true,
        BLOB: () => true,
        JSON: (x: string) => {
            try {
                JSON.parse(x);
            } catch(err) {
                return false;
            }
            return true;
        },
    },
    LENGTH: {
        MIN: (x: string, len1: number) => Boolean(x && x.length >= len1),
        MAX: (x: string, len1: number) => Boolean(x && x.length <= len1),
        MIN_MAX: (x: string, len1: number, len2?: number) => Boolean(x && x.length >= len1 && len2 && x.length <= len2)
    },
    REQUIRED: (x: string) => Boolean(x),
    MATCH: (x: string, y: string) => x === y,
    EGUAL: (x: string,  o: any, y: string) => Boolean(y && x === o[y]),
    REVALIDATE: (x: string,  o: any, y: string) => { 
        console.info('re validate - x, o, y', x, o, y)
        /*
        const showText = o[FormSymbolKey]['showHelperText'];
        if (showText) {
            // reevalidate all validation on y property & show error if needed at that field
            o.validatorData(y, o[y]);   
            o[FormSymbolKey]['showHelperText'](y);
        }
        */
        return true; 
    },
}

export function validator<T>(rule: string, message: string, options: IValidatorOption<T> = []): ValidationCondition<T> {
    if (typeof options === 'function') {
        return (x: string, o?: T) => !(options as IVCondition<T>)(x, o) && ({
            type: rule,
            message: message
        });
    }
    const v = getDeepProp(validatorData, rule);
    if (v) {
        return (x: string, o?: T) => {
            if (!rule.includes('.') && options[0] !== o) (options as any[]).unshift(o);
            return !v(x, ...(options as any[])) && ({
                type: rule,
                message: message
            });
        }
    }
    return () => false;
};

export const validationKey = Symbol('validation');
export type ValidationData<T> = {
    rule: string;
    message: string;
    options: IValidatorOption<T>;
    validator: ValidationCondition<T>;
}
export type ValidationMap<T> =  Map<string, Set<ValidationData<T>>>;

export function CV<T>(rule: ValidationData<T>['rule'], message: ValidationData<T>['message'], options: ValidationData<T>['options'] = []) {
    return function (target: IBaseModel<T>, property: string, descriptor: PropertyDecorator) {
        const targetParent = target.constructor;
        const map: ValidationMap<T> = targetParent[validationKey] || new Map();
        if (!targetParent[validationKey]) { targetParent[validationKey] = map; }
        const validations = map.get(property) || new Set();
        validations.add({
            rule,
            message,
            options,
            validator: validator(rule, message, options)
        });
        map.set(property, validations);
        return descriptor;
    } as IDecoratorSignature;
}
