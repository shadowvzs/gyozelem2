import { Component, Fragment, Prop, h } from '@stencil/core';

export type IOption = string | [string, string];

@Component({
    tag: 'auto-complete-input',
    shadow: false
})

export class Autocomplete {

    @Prop()
    attrs: Record<string, any> = {};

    @Prop()
    options: IOption[] = [];

    @Prop()
    onSelect: (value: string, label?: string) => void;

    render() {
        const id = 'autocomplete_id' + Math.random();
        return (
            <Fragment>
                <input {...this.attrs} list={id} />

                { this.options.length && (
                    <datalist id={id}>
                        {this.options.map(x => {
                            const [value, label] = Array.isArray(x) ? x : [x, x];
                            return <option value={value} onClick={() => this.onSelect(value, label)}> {label} </option>;
                        })}
                    </datalist>
                )}
            </Fragment>
        );
    }
}

/*
<input list="ice-cream-flavors" id="ice-cream-choice" name="ice-cream-choice" />

<datalist id="ice-cream-flavors">
    <option value="Chocolate">
    <option value="Coconut">
    <option value="Mint">
    <option value="Strawberry">
    <option value="Vanilla">
</datalist>
*/