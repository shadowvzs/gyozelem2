export interface IDraggable {
    remove: () => void;
}

export type MouseEventCallback = (event: MouseEvent) => void;

class Draggable implements IDraggable {
    private cX: number = 0;
    private cY: number = 0;
    private x: number = 0;
    private y: number = 0;
    private shiftX = 0;
    private shiftY = 0;
    private panel: HTMLElement;
    private header: HTMLElement;
    private maxWidth: number = 0;
    private maxHeight: number = 0;
    private scrollerElem: Element = document.scrollingElement || document.documentElement;

    constructor(targetElem: HTMLElement, targetHeader?: HTMLElement) {
        // e1.style.position = 'fixed';
        this.panel = targetElem;
        this.header = targetHeader || targetElem;
        const t = this as Record<string, any>;
        ['onMouseDown', 'onMouseUp', 'onMouseMove'].forEach(e => t[e] = t[e].bind(t));
        this.header.onmousedown = this.onMouseDown;
    }

    private move(x: number, y: number): void {
        this.panel.style.left = x+'px';
        this.panel.style.top = y+'px';
    }

    private onMouseMove (e: MouseEvent): void {
        this.x = e.clientX - this.shiftX;
        this.y = e.clientY - this.shiftY;
        this.cX = this.x >  this.maxWidth ? this.maxWidth : this.x < 0 ? 0 : this.x;
        this.cY = this.y >  this.maxHeight ? this.maxHeight : this.y < 0 ? 0 : this.y;
        this.move(this.cX, this.cY);
    }

    private packPosition(el: HTMLElement) {
        if (!el) return;
        if (el.style.top) el.style.top = parseInt(el.style.top) - this.scrollerElem.scrollTop + 'px';
        if (el.style.left) el.style.left = parseInt(el.style.left) - this.scrollerElem.scrollLeft + 'px';
    }

    private unpackPosition(el: HTMLElement) {
        if (!el) return;
        if (el.style.top) el.style.top = parseInt(el.style.top) + this.scrollerElem.scrollTop + 'px';
        if (el.style.left) el.style.left = parseInt(el.style.left) + this.scrollerElem.scrollLeft + 'px';
    }

    private onMouseUp (): void {
        this.unpackPosition(this.panel);
        this.remove(true);
        this.panel.dataset.move = 'false';
    }

    private onMouseDown(e: MouseEvent): void {
        if (this.panel.dataset.move === 'true') return;
        this.packPosition(this.panel);
        this.maxWidth = Math.max(document.body.offsetWidth, document.documentElement.offsetWidth) - this.panel.offsetWidth;
        this.maxHeight =  Math.max(document.body.offsetHeight, document.documentElement.offsetHeight) - this.panel.offsetHeight;
        this.panel.dataset.move = 'true';
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);
        this.shiftX = e.clientX - this.panel.offsetLeft;
        this.shiftY = e.clientY - this.panel.offsetTop;
    }

    public remove(withoutMouseDown?: boolean): void {
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
        if (!withoutMouseDown) { this.header.onmousedown = null; }
    }
}

export default Draggable;