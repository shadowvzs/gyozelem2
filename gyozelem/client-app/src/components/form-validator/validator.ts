import externalDependencies from "./dependencies";
import { IValidatorData, IValidatorOption, ValidationCondition, IVCondition, IValidation, IBaseModel, IDecoratorSignature } from "./types";

const { getDeepProp } = externalDependencies;

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
        LOWER_UPPER_NUM: (x: string) => new RegExp('^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*$').test(x),
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
        console.log('re validate - x, o, y', x, o, y)
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
            if (rule.indexOf('.') < 0 && options[0] !== o) (options as any[]).unshift(o);
            return !v(x, ...(options as any[])) && ({
                type: rule,
                message: message
            });
        }
    }
    return () => false;
};

export function CV<T>(rule: string, message: string, options: IValidatorOption<T> = []) {
    return function (target: IBaseModel<T>, property: string, descriptor: PropertyDecorator) {
        const targetParent = target.constructor as unknown as { $validation: IValidation<T> };
        if (!targetParent.$validation) { targetParent.$validation = {}; }
        if (!targetParent.$validation[property]) { targetParent.$validation[property] = []; }
        targetParent.$validation[property].push(validator(rule, message, options));
        return descriptor;
    } as IDecoratorSignature;
}

/*
// Method 1 - No decorator:
const userValidation = {
    email: [
        addValidation('TYPE.EMAIL', 'Helytelen email')
    ],
    password: [
        addValidation('TYPE.STR_AND_NUM', 'A jelszó szám és betűből álljon'),
        addValidation('LENGTH.MIN_MAX', 'A jelszó 6-32 karakter kell legyen', [6, 32]),
    ],
    pali: [
        addValidation('REQUIRED', 'Pali hianyzik'),
    ]
} as  IValidation<ILoginUser>;

class User extends Base {
    public $validation = userValidation;
    public email: string;
    public password: string;
    public pupucs: string;
}

// Method2 Decorator
class User extends Base {
    @CV('TYPE.EMAIL', 'Helytelen email')
    public email: string;
    @CV('TYPE.STR_AND_NUM', 'A jelszó szám és betűből álljon')
    @CV('LENGTH.MIN_MAX', 'A jelszó 6-32 karakter kell legyen', [6, 32])
    public password: string;
    @CV('REQUIRED', 'A papucs hianyzik')
    public pupucs: string;
}
*/
