import { Component, State, JSX, Prop, h } from '@stencil/core';
import FSObject from '../../model/FSObject';
import { ISlider } from './types';


@Component({
    tag: 'slider-container',
    styleUrl: 'slider.css',
    shadow: false
})

export class Slider {

    protected $slide: HTMLElement;

    @Prop()
    config: ISlider.Config;
    
    @State() 
    state: ISlider.State = {
        ref: null,
        counter: null,
        idx: 0,
        items: [],
    }

    componentWillLoad() {
        const { index } = this.config || {};
        if (index) { this.setState({ idx: index < 0 ? 0 : index }); }
    }

    disconnectedCallback() {
        console.info('removed the slider from dom')
    }

    private setState = (state: Partial<ISlider.State>) => {
        this.state = {...this.state, ...state };
    }

    private onNext = () => {
        this.setState({ idx: (this.state.idx + 1) % this.config.items.length });
    }
    
    private onPrev = () => {
        this.setState({ idx: (this.state.idx === 0 ? this.config.items.length : this.state.idx) - 1 });
    }

    private defaultRenderers = {
        image: (item: FSObject): JSX.Element => (<img src={item.url} alt={item.name} />),
        youtube: (item: FSObject): JSX.Element => (<iframe src={item.url} allow="autoplay; encrypted-media; fullscreen" width="100%" height="100%" frameborder="0" />)
    }

    private defaultItemRender = (item: FSObject) => {
        const { idx } = this.state;
        const variant = this.config.variant || 'image';

        return (
            <div class="slider-body" ref={(el: HTMLElement) => this.$slide = el}>
                {this.defaultRenderers[variant as ISlider.IVariant](item)}
                <footer>
                    <div class="white fs-16 abs-h-center counter">
                        {(idx + 1).toString()} / {this.config.items.length.toString()}
                    </div>
                </footer>
            </div>
        );
    };

    render() {
        const render = this.config.itemRender || this.defaultItemRender;
        return (
            <div class={`slider ratio-${this.config.ratio || '16-9'}`}>
                { render(this.config.items[this.state.idx]) }
                <a class="left arrow" onClick={this.onPrev}> ❰ </a>
                <a class="right arrow" onClick={this.onNext}> ❱ </a>
            </div>
        );
    }
}