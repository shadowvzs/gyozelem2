import { Component, State, Element, Host, h } from '@stencil/core';
import { broadcast } from '../../global/Broadcast';
import { IContextMenu } from './types';

@Component({
    tag: 'context-menu',
    styleUrl: 'context-menu.css',
    shadow: false
})

export class ContextMenu {

    private contextMenuSubscription = broadcast.on('contextMenu:open', (config: IContextMenu.Config<unknown>) => {
        config.event.stopPropagation();
        config.event.preventDefault();
        const menuElem = this.createMenu(config);
        if (!menuElem) { return; }
        this.$activeMenu = this.setMenuPosition(menuElem, config);
    });

    @Element()
    private $elem: HTMLElement;

    @State()
    $activeMenu: HTMLElement | null = null;

    constructor() {
        this.createMenu = this.createMenu.bind(this);
    }

    componentWillLoad() {
        document.addEventListener('click', this.globalClickHandler);
    }

    disconnectedCallback() {
        this.contextMenuSubscription.unsubscribe();
        document.removeEventListener('click', this.globalClickHandler);
    }

    private globalClickHandler = (e: MouseEvent) => {
        if (this.$activeMenu && !this.$activeMenu.contains(e.target as Node)) {
            this.onClose();
        }
    }

    private onClose = () => {
        this.$activeMenu.remove();
        this.$activeMenu = null;
    }

    private createMenu<T>({ menu, item, data, event }: IContextMenu.Config<T>): HTMLDivElement | void {
        const div = document.createElement('div');
        const ul = document.createElement('ul');
        div.oncontextmenu = (ev: MouseEvent) => ev.preventDefault();
        div.appendChild(ul);
        const menuList = Object.values(menu)
            .filter(m => m && (m.visible === undefined || typeof m.visible === 'function' ? m.visible(item) : m.visible));
            
        if (menuList.length === 0) { return console.warn('no context menu options'); }

        menuList.forEach(({ action, enable, icon, label }) => {
                const disabled = enable !== undefined && (typeof enable === 'function' ? !enable(item) : !enable);
                const li = document.createElement('li');
                li.style.cssText = `display: flex;align-items: center;`;
                if (disabled) {
                    li.classList.add('disabled');
                } else {
                    li.onclick = () => {
                        this.onClose();
                        action(event, item, data);
                    }
                }
                const iconName = typeof icon === 'function' ? icon(item) : icon;
                const liLabel = typeof label === 'function' ? label(item) : label;
                if (iconName) {
                    li.innerHTML = `<fs-icon
                        singlelinelabel="true"
                        name="${iconName}"
                        color="active"
                        label="${liLabel}"
                        size='small'
                    />`;
                } else {
                    li.textContent = liLabel;
                }
                ul.appendChild(li);
            });
        return div;
    }

    private setMenuPosition = (elem: HTMLDivElement, { event }: IContextMenu.Config<unknown>) => {
        const { x, y } = event;
        // const rect = element.getBoundingClientRect();
        elem.style.left = x + 'px';
        elem.style.top = y + 'px';
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