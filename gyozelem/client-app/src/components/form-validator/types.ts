export declare namespace IFormValidator {
    interface State {
        errors: Record<string, IValidationError[]>;
        isDirty: boolean;
        model: Record<keyof IBaseModel, any>
        touched: Record<string, boolean>;
    }
}

export type ErrorFormatter = (errors: IValidationError[], errorSeparator?: string) => string;

export type IVCondition<T> = (x: string, o?: T) => boolean;
export type IValidatorOption<T> = any[] | IVCondition<T>;

export interface IValidationError {
    type: string;
    message: string;
}


export type ObjPart<T, K> = Partial<Record<keyof T, K>>;

type IRegexValidator = (arg0: string) => boolean;
type ILengthValidator = (arg0: string, arg1: number, arg2?: number) => boolean;
type IStringCompareValidator = (arg0: string, o: any, arg1: string) => boolean;
// type aliases
type IValidator = IRegexValidator | ILengthValidator | IStringCompareValidator;
export type IValidatorData = Record<string, Record<string, IValidator> | IValidator>;

export type ValidationCondition<T> = (x: any, o?: T) => false | IValidationError;
export type IValidation<T = any> = ObjPart<T, ValidationCondition<T>[]>;

export type IBaseModel<T = any> = T & { constructor: Function; }

export type IDecoratorSignature = any;