import { Component, State, Prop, Host, Element, h } from '@stencil/core';
import { forEach, objFor, flat, objValues } from '../../core/util/performance';
import { IValidationError, IBaseModel, IValidation, IFormValidator } from './types';

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
    validateAt: 'CHANGE' | 'SUBMIT' = 'CHANGE';

    @Prop()
    errorFormatter: (errors: IValidationError[]) => string = (errors: IValidationError[]) => errors.map(e => e.message).join(', ');

    @Prop()
    model!: IBaseModel;

    @Prop()
    submit!: (arg0: IBaseModel) => void;

    @State()
    state: IFormValidator.State = {
        errors: {},
        isDirty: false,
        model: this.model,
        touched: {}
    }

    connectedCallback = () => {
        this._validations = this.model?.constructor?.$validation;
        this.state.model = Object.assign({}, this.model);
        const elements: HTMLInputElement[] = Array.from(this.$form.querySelectorAll('input[name],select[name],textarea[name]'));
        elements.forEach(inputElem => {
            const name = inputElem.getAttribute('name');
            inputElem.oninput = this.inputConnector;
            inputElem.classList.add('form-input');
            inputElem.value = this.model[name] || '';
            // console.log(this.model[name], name, this.model)
            this._inputElems[inputElem.name] = inputElem;
            this._errorElems[inputElem.name] = inputElem.parentElement.querySelector('.error-message');
        });

        this.$submit = this.$form.querySelector('[type="submit"],.submit');
    }

    disconnectedCallback = () => {
        const elements: HTMLElement[] = Array.from(this.$form.querySelectorAll('input,select,textarea'));
        elements.forEach(e => e.onchange = null);
        this._inputElems = {};
        this._errorElems = {};
    }

    private _validations: IValidation;
    private _inputElems: Record<string, HTMLInputElement> = {};
    private _errorElems: Record<string, HTMLDivElement> = {};
    protected $submit: HTMLElement;

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
        
        const errorMsg = this.errorFormatter(this.state.errors[name] || []);
        if (this._errorElems[name]) { this._errorElems[name].innerHTML = errorMsg; }

        input.title = errorMsg;
        if (!this.state.isDirty) { this.state.isDirty = true; }

        if (this.validateAt === 'CHANGE' && this.$submit) { this.submitButtonValidation(); }
        return isValid;
    }

    private submitButtonValidation = () => {
        const hasError = !!this.getError().length;
        (this.$submit as HTMLInputElement).disabled = hasError;
        this.$submit.classList[hasError ? 'add' : 'remove']('disabled');
    }

    private setProp = (key: string, value: any) => {
        const { model } = this.state;
        model[key] = value;
        this.setState({ model });
        return this.validateAt !== 'CHANGE' || this.validator(key, value);
    }

    private validator = (key: string, value: any): boolean => {
        const vld = this._validations[key] || [];
        this.state.errors[key] = [] as IValidationError[];
        const errors = [] as IValidationError[];
        forEach(vld, (cond) => {
            const err = cond(value, this.state.model);
            if (err) { errors.push(err); }
        });

        this.setErrors(key, errors);
        return !errors.length;
    }

    public runValidations = (): void => {
        const model = this.getValues();
        objFor(this._validations, (k) => {
            const isValid = this.validator(k, model[k]);
            const input = this._inputElems[k];
            if (!input) { return; }
            input.dataset.valid = isValid.toString();
            const errorMsg = this.errorFormatter(this.state.errors[k] || []);
            if (this._errorElems[k]) { this._errorElems[k].innerHTML = errorMsg; }
            input.title = errorMsg;  
        });
        this.submitButtonValidation();
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

    public getValues(): IBaseModel {
        const reserved = ['_', '$'];
        const obj = {};
        const model = this.state.model;
        Object.getOwnPropertyNames(model)
            .filter(x => reserved.indexOf(x[0]) < 0 && typeof model[x] !== 'function')
            .forEach(x => obj[x] = model[x]);
        return obj;
    }

    private onSubmit = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        this.runValidations();
        const errors = this.getError();
        if (errors.length) {
            alert(errors.map(x => x.message).join(', ')); // notify.send('error', errors.map(x => <div>{x.message}</div>)) 
            return false;
        }
        this.submit(this.getValues());
        this.state.isDirty = false;
        Object.keys(this.state.touched).forEach(key => this.state.touched[key] = false);
        return false;
    }

    render() {
        // console.log(this.state, this.model)
        return (
            <Host>
                <form onSubmit={this.onSubmit} acceptcharset='UTF-8'>
                    <slot />
                </form>
            </Host>
        );
    }
}