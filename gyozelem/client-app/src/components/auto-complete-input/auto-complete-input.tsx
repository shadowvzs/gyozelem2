import { Component, Prop, Element, State, JSX, h } from '@stencil/core';
import { iconList } from '../../icons/icons';
import { elementRelativeDistanceVsViewport } from '../../util/dom';

export type IOption = string | [string, string];

const DownArrow = iconList['DownArrow'];

@Component({
    tag: 'auto-complete-input',
    styleUrl: 'auto-complete-input.css',
    shadow: false
})

export class AutoCompleteInput {

    @Element() el: HTMLElement;
    protected inputElem: HTMLInputElement;
    protected listPlaceholder: HTMLDivElement;

    @Prop() inputProps: Record<string, any>;
    @Prop() items: string[] = [];
    @Prop() value: string | string[];
    @Prop() multiSelect:   boolean;
    @Prop() keepOpen:      boolean;
    @Prop() singleLine:    number;

    @Prop() onSelect:         (value: string) => void;
    @Prop() onChange:         (value: string[]) => void;
    
    @Prop() itemRender:       (value: string) => JSX.Element;
    @Prop() valueRender:      (value: string) => JSX.Element;
    
    @Prop() suggestionRender: (value: string) => JSX.Element;

    @State() text: string = '';
    @State() showSuggestion: boolean = false;
    @State() placeholderPosition = {
        top: 'auto',
        bottom: 'auto',
        maxHeight: 'auto'
    }


    private default = {
        itemRender: (x: string) => x,
        valueRender: (x: string) => x,
    }

    private onSelectHandler = (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();

        let target = event.target as HTMLElement;
        if (!target.dataset.value) {
            target = target.closest('.list-item[data-value]');
        }

        if (!target.dataset.value) {
            return;
        }

        const value = target.dataset.value;
        console.log('selected value', value);
        if (this.onSelect) {
            this.onSelect(value);
        }

        if (!this.keepOpen) {
            this.showSuggestion = false;
        }
    }

    private onChangeHandler = (event: KeyboardEvent) => {
        const value = (event.target as HTMLInputElement).value;
        if (value !== this.text) { 
            this.text = value;
        }
        if (this.onChange) {
            this.onChange([value]);
        }
    }

    private clickAwayHandler = (event: MouseEvent) => {
        if (!this.el.contains(event.target as Node)) {
            document.removeEventListener('click', this.clickAwayHandler);
            this.showSuggestion = false;
        }
    }

    private inputClickHandler = () => {
        document.addEventListener('click', this.clickAwayHandler);
        if (this.listPlaceholder) {
            const distances = elementRelativeDistanceVsViewport(this.listPlaceholder);
            const newPosition = {
                top: 'auto',
                bottom: 'auto',
                maxHeight: 'auto'
            }

            if (distances.bottom < 100 && distances.top > 300) {
                newPosition.bottom = '0px';
                newPosition.maxHeight = distances.top - 10 + 'px';
            } else {
                newPosition.top = '-5px';
                newPosition.maxHeight = distances.bottom - 10 + 'px';
            }

            this.placeholderPosition = newPosition;
        }
        this.showSuggestion = true;
    }

    private renderValueItem = (x: string, value: string[], valueRender: (value: string) => JSX.Element) => {
        return (
            <div class="value-item">
                {valueRender(x)}
                {x !== value.slice(-1)[0] ? ', ' : ''}
            </div>
        );
    }

    private renderListItem = (x: string, value: string[], itemRender: (value: string) => JSX.Element) => {
        const checkboxType = value.includes(x) ? 'Checked' : 'Unchecked';
        const Checkbox = iconList[checkboxType];
        return (
            <div
                class={`list-item ${checkboxType.toLowerCase()}`}
                data-value={x} 
                onClick={this.onSelectHandler}
            >
                {this.multiSelect && this.keepOpen && <Checkbox class={checkboxType.toLowerCase()} />}
                {itemRender(x)}
            </div>
        );
    }

    render() {
        const itemRender  = this.itemRender  || this.default.itemRender;
        const valueRender = this.valueRender || this.default.valueRender;
        const value = Array.isArray(this.value) ? this.value : [this.value];
        const valueIntoInput = Array.isArray(this.items) && Boolean(this.singleLine);
        let inputValue = this.text;
        if (valueIntoInput) {
            inputValue = value.slice(0, this.singleLine).map(itemRender).join(', ');
            if (value.length > this.singleLine) {
                inputValue += ` (+${value.length - this.singleLine} more)`
            }
        }

        return (
            <div class='auto-complete-root'>
                <div class='value-area'>
                    {!valueIntoInput && value.map(x => this.renderValueItem(x, value, valueRender))}
                    <input 
                        value={inputValue}
                        onFocus={valueIntoInput && function(){ this.blur(); }}
                        {...this.inputProps} 
                        ref={el => this.inputElem = el}
                        onInput={this.onChangeHandler} 
                        onClick={this.inputClickHandler}
                    />
                    {Array.isArray(this.items) && <DownArrow class='expand-icon' />}
                </div>
                <div class='list-area' ref={el => this.listPlaceholder = el}>
                    { this.showSuggestion && this.items.length && (
                        <div class='suggestion' style={this.placeholderPosition}>
                            {this.items.map(x => this.renderListItem(x, value, itemRender))}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

/*
function isElementInViewport (el) {

    // Special bonus for those using jQuery
    if (typeof jQuery === "function" && el instanceof jQuery) {
        el = el[0];
    }

    var rect = el.getBoundingClientRect();var h = window.innerHeight || document.documentElement.clientHeight;
  console.log(h-rect.bottom)
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) 
    );
}

                <input {...this.inputProps} list={id} onInput={this.onChangeHandler} />
                { this.items.length && (
                    <datalist id={id}>
                        {this.items.map(x => {
                            const label = this.textRender ? this.textRender(x) : x;
                            const value = x;
                            return (
                                <option 
                                    value={value} 
                                    data-value={value} 
                                    onClick={this.onSelectHandler}
                                >
                                    <a>ssss</a>
                                    {label} 
                                </option>
                            );
                        })}
                    </datalist>
                )}
*/

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