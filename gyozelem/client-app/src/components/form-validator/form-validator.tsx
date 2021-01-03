import { Component, State, Prop, Host, Element, h } from '@stencil/core';
import { broadcast } from '../../global/Broadcast';
import { flat, objValues } from '../../util/performance';
import { validationKey, ValidationMap } from '../../util/validator';
import { IValidationError, IBaseModel, IFormValidator, ErrorFormatter } from './types';

@Component({
    tag: 'form-validator',
    styleUrl: 'form-validator.css',
    shadow: false
})

export class FormValidator {

    @Element()
    private $form: HTMLFormElement;

    @Prop()
    autoDisable: boolean = true;

    @Prop()
    fullWidth: boolean = true;

    @Prop()
    validateAt: 'CHANGE' | 'SUBMIT' = 'CHANGE';

    @Prop()
    errorSeparator: string = ', ';

    @Prop()
    errorFormatter: ErrorFormatter = (errors: IValidationError[], errorSeparator?: string) => errors.map(e => e.message).join(errorSeparator || this.errorSeparator);

    @Prop()
    model!: IBaseModel;

    @Prop()
    submit!: (arg0: IBaseModel) => void;

    @State()
    state: IFormValidator.State = {
        errors: {},
        isDirty: false,
        model: this.model || {},
        touched: {}
    }

    private _validations: ValidationMap<any> = new Map();
    private _inputElems:  Record<string, HTMLInputElement> = {};
    private _errorElems:  Record<string, HTMLDivElement>   = {};
    private _iconElems:   Record<string, HTMLDivElement>   = {};
    protected $submit:    HTMLInputElement;


    connectedCallback = () => {
        if (this.model?.constructor?.[validationKey] instanceof Map) {
            this._validations = this.model?.constructor?.[validationKey];    
        }
        if (this.model) {
            this.state.model = this.model;
        }
        const elements: HTMLInputElement[] = Array.from(this.$form.querySelectorAll('input[name],select[name],textarea[name]'));
        elements.forEach(inputElem => {
            const name = inputElem.getAttribute('name');
            inputElem.oninput = this.inputConnector;
            inputElem.classList.add('form-input');
            if (this.model) {
                inputElem.value = this.model[name] || '';
            }

            this._inputElems[inputElem.name] = inputElem;
            this._errorElems[inputElem.name] = inputElem.parentElement.querySelector<HTMLDivElement>('.error-message');
            const infoElem = inputElem.parentElement.querySelector<HTMLDivElement>('.input-info');
            this._iconElems[inputElem.name] = infoElem;

            const validations = this._validations.get(name);
            if (infoElem && validations && validations.size > 0 ) {
                const messages = [...validations].map(x => x.message).join('\r\n');
                infoElem.innerHTML = `<fs-icon width="24" height="24" title="${messages}" name="CircleInfo" />`;
            }
        });

        this.$submit = this.$form.querySelector<HTMLInputElement>('[type="submit"],.submit');
    }

    disconnectedCallback = () => {
        const elements: HTMLElement[] = Array.from(this.$form.querySelectorAll('input,select,textarea'));
        elements.forEach(e => e.oninput = null);
        this._inputElems = {};
        this._errorElems = {};
        this._iconElems = {};
    }

    private setState = (partState: Partial<IFormValidator.State>) => {
        this.state = { ...this.state, ...partState };
    };

    private setErrors = (key: string, errorList: IValidationError[]) => {
        const errors = this.state.errors;
        errors[key] = errorList;
        this.setState({ errors: errors });
    }

    private inputConnector = (ev: KeyboardEvent): boolean => {
        const input = ev.target as HTMLInputElement;
        const { name, value } = input;
        const isValid = this.setProp(name, value);
        input.dataset.valid = isValid.toString();
        if (!this.state.touched[name]) { this.state.touched[name] = true; }
      
        if (this._errorElems[name] && this._validations) { 
            this._errorElems[name].innerHTML = this.errorFormatter(this.state.errors[name] || []); 
        }

        if (this._iconElems[name] && this._validations) {
            const errors = this.errorFormatter(this.state.errors[name] || [], '\r\n');
            const color = errors ? 'error' : 'default';
            const iconName = errors ? 'TriangleAlert' : 'CircleOk';
            const msg = errors || 'A mezo helyesen van kitoltve!';
            this._iconElems[name].innerHTML = `
                <fs-icon width="24" color="${color}" height="24" name="${iconName}" title="${msg}" />
            `;
        }

        input.title = this.errorFormatter(this.state.errors[name] || [], '\r\n');
        if (!this.state.isDirty) { this.state.isDirty = true; }
        if (this.$submit) { this.submitButtonValidation(); }
        input.value = value;
        return isValid;
    }

    private submitButtonValidation = () => {
        const hasError = this.getError().length > 0;
        if (hasError) {
            this.$submit.disabled = true;
            this.$submit.classList.add('disabled');
        } else {
            this.$submit.removeAttribute('disabled');
            this.$submit.classList.remove('disabled');
        }
        this.$submit.disabled = hasError;
        this.$submit.classList[hasError ? 'add' : 'remove']('disabled');
    }

    private setProp = (key: string, value: any): boolean => {
        const { model } = this.state;
        model[key] = value;
        this.setState({ model });
        if (this.validateAt !== 'CHANGE') {
            this.setErrors(key, []);
            return true;
        } else {
            return this.validator(key, value);
        }
    }

    private validator = (key: string, value: any): boolean => {
        const vld = this._validations.get(key);
        this.state.errors[key] = [] as IValidationError[];
        const errors = [] as IValidationError[];
        vld.forEach(v => {
            const err = v.validator(value, this.state.model);
            if (err) { errors.push(err); }
        })
        this.setErrors(key, errors);
        return !errors.length;
    }

    public runValidations = (): void => {
        const model = this.getValues();
        if (this._validations instanceof Map) {
            this._validations.forEach((_, key) => {
                const isValid = this.validator(key, model[key]);
                const input = this._inputElems[key];
                if (!input) { return; }
                input.dataset.valid = isValid.toString();
                const errorMsg = this.errorFormatter(this.state.errors[key] || []);
                if (this._errorElems[key]) { this._errorElems[key].innerHTML = errorMsg; }
                input.title = errorMsg;  

            });
            if (this.$submit) { this.submitButtonValidation(); }
        }
    }

    public getError(key?: string): IValidationError[] {
        let errors: IValidationError[];
        if (!key) {
            errors = flat(objValues<IValidationError>(this.state.errors), 1)
        } else {
            errors = this.state.errors[key];
        }
        return errors || [];
    }

    public getValues(): Record<keyof IBaseModel, any> {
        const reserved = ['_', '$'];
        const obj = {};
        const model = this.state.model;
        Object.getOwnPropertyNames(model)
            .filter(x => reserved.indexOf(x[0]) < 0 && typeof model[x] !== 'function')
            .forEach(x => obj[x] = model[x]);
        return obj;
    }

    private onSubmit = async (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        this.runValidations();
        const errors = this.getError();
        if (errors.length) {
            broadcast.emit('notify:send', { type: 'error', message: errors.map(x => x.message).join('<br />')});
        } else {
            this.submit(this.getValues());
            this.state.isDirty = false;
            Object.keys(this.state.touched).forEach(key => this.state.touched[key] = false);
        }
        return false;
    }

    render() {
        return (
            <Host class={this.fullWidth ? "full-width" : ''}>
                <form class={this.fullWidth ? "full-width" : ''} onSubmit={this.onSubmit} acceptcharset='UTF-8'>
                    <slot />
                </form>
            </Host>
        );
    }
}