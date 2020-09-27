import { Component, State, Element, Host, h } from '@stencil/core';
import { IPanelManager } from './types';
import Draggable from "../../core/util/draggable";
import { guid, array2TreeMap, getChildIds, delay } from "../../core/util/core";

interface RegistryEvent extends Event {
    detail: Partial<IPanelManager.Config>;
}

@Component({
    tag: 'panel-manager',
    styleUrl: 'panel-manager.css',
    shadow: false
})

export class PanelManager {

    @Element() $elem: HTMLElement;

    @State()
    private state: IPanelManager.State = {
        activePanelId: '',
        panels: array2TreeMap<IPanelManager.Config>([], item => item.windowId, item => item.callerWindowId, { windowId: '-1' } ),
    };

    private actionDispatcherElem = document;

    componentWillLoad() {
        document.addEventListener('windowRegistry', this.windowRegistry);
        this.actionDispatcherElem.addEventListener('componentAction', this.componentActionHandler);
    }

    disconnectedCallback() {
        document.removeEventListener('windowRegistry', this.windowRegistry);
        this.actionDispatcherElem.removeEventListener('componentAction', this.componentActionHandler);
    }

    private windowRegistry = (e: RegistryEvent) => {
        const { windowId } = e.detail;
        if (windowId) {
            // focus to existing window
        } else {
            this.createNewWindow(e.detail);
        }
        this.state.activePanelId = windowId;
        console.log('new window', e, this.$elem);
    }

    private componentActionHandler = (e: IPanelManager.SimpleEvent) => {
        const { id, type } = e.detail;
        switch(type) {
            case 'MINIMIZE':
                break;
            case 'CLOSE':
                this.closeWindows(id);
                break;
        }
    }

    private emitBasicEvent = (id: string, type: IPanelManager.BaseEventTypes) => {
        const event = new CustomEvent('componentAction', { detail: { id, type: 'CLOSE' } });
        const cbName = 'onWindow' + type[0] + type.substr(1).toLowerCase();
        const $elem = this.state.panels.valueMap[id].item.elem;
        if (typeof $elem[cbName] === 'function') { $elem[cbName](); }
        this.actionDispatcherElem.dispatchEvent(event);
    }

    private closeWindows = (id: string) => {
        const valueMap = this.state.panels.valueMap;
        const ids = getChildIds(this.state.panels, id, []).reverse();
        const elems = ids.filter(panelId => valueMap[panelId]).map(pid => valueMap[pid].item.elem);
        this.state.panels.remove(id, ids);
        elems.forEach(async (e) => {
            if (e.classList.contains('show')) {
                e.classList.remove('show');
                await delay(0.5);
            }
            e.remove();
        });
    }


    private createNewWindow(config: Partial<IPanelManager.Config>) {
        const { componentTag, containerConfig, elem } = config;
        let $elem = elem || document.createElement(componentTag);
        const id = config.newWindowId ?? guid();
        if (config.componentProps) {
            config.componentProps['onClose'] = () => this.closeWindows(id);
            Object.entries(config.componentProps).forEach(([key, value]) => $elem[key] = value);
        }
        const $cmp = $elem;
        if (containerConfig) {
            const panelContainer = document.createElement('div');
            panelContainer.innerHTML = `
                <div class='inner'>
                    <div class='header no-select'>
                        <h4> ${containerConfig.title || 'New Window'} </h4>
                        ${!containerConfig.hideMinimize ? '<div class="minimize">_</div>' : ''}
                        ${!containerConfig.hideClose ? '<div class="close">✖</div>' : ''}
                    </div>
                    <div class='content'></div>
                </div>`;
            panelContainer.querySelector('.content').appendChild($elem);
            panelContainer.className = `panel-container ${containerConfig.theme || 'blue-theme'}`;
            panelContainer.dataset.windowId = id;
            const header = panelContainer.querySelector<HTMLElement>('.inner div.header');
            if (!containerConfig.hideMinimize) {
                header.querySelector<HTMLElement>('.minimize').onclick = () => this.emitBasicEvent(id, 'MINIMIZE');
            }

            if (!containerConfig.hideClose) { 
                header.querySelector<HTMLElement>('.close').onclick = () => this.emitBasicEvent(id, 'CLOSE');                
            }

            $elem = panelContainer;
            if (!containerConfig.fixedPosition) {
                new Draggable($elem, header);
            }
        }
        
        $cmp.dataset.componentId = id;
        this.$elem.appendChild($elem);

        if (containerConfig && containerConfig.initState !== 'hide') {
            setTimeout(() => $elem.classList.add(containerConfig.initState || 'show'), 100);
        }

        const windowConfig: IPanelManager.Config = {
            ...config,
            elem: $elem,
            component: $cmp,
            windowId: id,
            createdAt: new Date(),
        }

        $elem['windowConfig'] = windowConfig;
        // $elem['onClose'] = () => windowConfig.onClose;

        this.state.panels.add({
            id: windowConfig.windowId,
            parent: config.linkWithCaller ? this.state.panels.valueMap[config.callerWindowId] : undefined,
            item: windowConfig,
            childs: []
        });
        
        if (config.panelHook) {
            config.panelHook(windowConfig);
        }
        
        window['panels'] = this.state;
        // this.state.panels[windowConfig.windowId] = windowConfig;
    }

    render() {
        return (<Host></Host>);
    }
}