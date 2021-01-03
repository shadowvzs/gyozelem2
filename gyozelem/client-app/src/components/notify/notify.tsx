import { Component, Prop, h } from '@stencil/core';
import { broadcast } from '../../global/Broadcast';
import { INotify } from './types';

@Component({
    tag: 'notify-container',
    styleUrl: 'notify.css',
    shadow: true
})

export class NotifyContainer {

    @Prop()
    validation: Record<string, any>;

    private $container: HTMLDivElement;
    private map = new WeakMap();
    private NOTIFY_DURATION = 3000;
    private LETTER_DURATION_RATIO = 100;
    private CLOSE_CLASS = 'close-notify';
    private TRANSITION_CLASS = 'slidein';

    private newMessageElement = ({ closeClass, message, onTransitionEnd, type }: INotify.Message) => {
        const $msg = document.createElement('div');
        $msg.classList.add('notify', type);
        $msg.ontransitionend = onTransitionEnd;
        $msg.innerHTML = `<span>${message}</span>`;
        
        const $close = document.createElement('div');
        $close.classList.add(closeClass);
        $close.innerHTML = '✗';
        $close.onclick = () => $msg.classList.remove(this.TRANSITION_CLASS);
        $msg.appendChild($close);
        return $msg;
    };

    private sendSubscription = broadcast.on('notify:send', ({ type, message }: { type: INotify.Types, message: string }) => {
        const $newMsg = this.newMessageElement({ type, message, onTransitionEnd: this.onTransitionEnd, closeClass: this.CLOSE_CLASS});
        const duration = this.NOTIFY_DURATION + this.LETTER_DURATION_RATIO * message.length;
        const timer = setTimeout(
            () => this.map.get($newMsg) && $newMsg.classList.remove(this.TRANSITION_CLASS),
            duration
        );
        this.map.set($newMsg, timer);
        this.$container.appendChild($newMsg);
        setTimeout( () => $newMsg.classList.add(this.TRANSITION_CLASS), 100);
    });

    private onTransitionEnd = (event: Event): void => {
        const $target = event.target as HTMLDivElement;
        if ($target.classList.contains(this.TRANSITION_CLASS)) return;
        $target.removeEventListener("transitionend", this.onTransitionEnd);
        this.removeNotify($target as HTMLDivElement);
        this.map.delete($target);
    }

    private removeNotify(elem: HTMLDivElement) {
        clearTimeout(this.map.get(elem));
        elem.remove();
    }

    disconnectedCallback() {
        this.sendSubscription.unsubscribe();
    }

    render() {
        return (
            <div ref={(e: HTMLDivElement) => this.$container = e}></div>
        );
    }
}
