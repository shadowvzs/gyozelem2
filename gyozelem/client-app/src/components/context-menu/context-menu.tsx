import { Component, State, Element, Host, h } from '@stencil/core';
import { IContextMenu } from './types';

@Component({
    tag: 'context-menu',
    styleUrl: 'context-menu.css',
    shadow: false
})

export class ContextMenu {

    @Element()
    private $elem: HTMLElement;

    @State()
    $activeMenu: HTMLElement | null = null;

    componentWillLoad() {
        document.addEventListener('contextMenu', this.contextMenuHandler);
        document.addEventListener('click', this.globalClickHandler);
    }

    disconnectedCallback() {
        document.removeEventListener('contextMenu', this.contextMenuHandler);
        document.removeEventListener('click', this.globalClickHandler);
    }

    private globalClickHandler = (e: MouseEvent) => {
        if (this.$activeMenu && !this.$activeMenu.contains(e.target as Node)) {
            this.onClose();
        }
    }

    private onClose = () => {
        console.log('close context menu');
        this.$activeMenu = null;
    }

    private contextMenuHandler = (e: IContextMenu.ContextMenuEvent<any>) => {
        e.preventDefault();
        e.stopPropagation();
        this.$activeMenu = this.setMenuPosition(this.createMenu(e.detail.menu), e.detail);
    }

    private createMenu = (menu: IContextMenu.Menu<any>[]): HTMLDivElement => {
        const div = document.createElement('div');
        const ul = document.createElement('ul');
        div.oncontextmenu = (ev: MouseEvent) => ev.preventDefault();
        div.appendChild(ul);
        menu.forEach(({ label, data, callback }) => {
            console.log(label)
            const li = document.createElement('li');
            li.textContent = label;
            li.onclick = (ev: MouseEvent) => callback(data, ev);
            ul.appendChild(li);
        });
        return div;
    }

    private setMenuPosition = (elem: HTMLDivElement, detail: IContextMenu.EventDetail<any>) => {
        // const rect = element.getBoundingClientRect();
        // console.log(rect.top, rect.right, rect.bottom, rect.left);
        elem.style.left = detail.x + 'px';
        elem.style.top = detail.y + 'px';
        elem.classList.add('menu-container');
        return elem;
    }

    render() {
        this.$elem.innerHTML = '';
        if (this.$activeMenu) {
            this.$elem.appendChild(this.$activeMenu);
        }
        return (
            <Host></Host>
        );
    }
}