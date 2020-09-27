import { Component, State, Host, JSX, Prop, h } from '@stencil/core';
import { ISlider } from './types';

@Component({
    tag: 'slider-container',
    styleUrl: 'slider.css',
    shadow: true
})


export class Slider {

    protected $slide: HTMLElement;

    @Prop()
    ratio: string;

    @Prop()
    callback: (item: ISlider.Item) => void;

    @Prop()
    itemRender: (state: ISlider.Item) => JSX.Element;

    @Prop()
    items!: ISlider.Item[];

    @Prop()
    variant: ISlider.IVariant;
    
    @State() 
    state: ISlider.State = {
        ref: null,
        counter: null,
        idx: 0,
        items: [],
    }

    private setState = (state: Partial<ISlider.State>) => {
        this.state = {...this.state, ...state };
    }

    private onNext = () => {
        this.setState({ idx: (this.state.idx + 1) % this.items.length });
    }
    
    private onPrev = () => {
        this.setState({ idx: (this.state.idx === 0 ? this.items.length : this.state.idx) - 1 });
    }

    private defaultRenderers = {
        image: (item: ISlider.Item): JSX.Element => (<img src={item.url} alt={item.description} />),
        youtube: (item: ISlider.Item): JSX.Element => (<iframe src={item.url} allow="autoplay; encrypted-media; fullscreen" width="100%" height="100%" frameborder="0" />)
    }

    private defaultItemRender = (item: ISlider.Item) => {
        const { idx } = this.state;
        const variant = this.variant || 'image';

        return (
            <div class="slider-body" ref={(el: HTMLElement) => this.$slide = el}>
                {this.defaultRenderers[variant as ISlider.IVariant](item)}
                <footer>
                    <div class="white fs-16 abs-h-center counter">
                        {(idx + 1).toString()} / {this.items.length.toString()}
                    </div>
                </footer>
            </div>
        );
    };

    render() {
        const render = this.itemRender || this.defaultItemRender;
        return (
            <Host class={`slider ratio-${this.ratio || '16-9'}`}>
                { render(this.items[this.state.idx]) }
                <a class="left arrow" onClick={this.onPrev}> ❰ </a>
                <a class="right arrow" onClick={this.onNext}> ❱ </a>
            </Host>
        );
    }
}