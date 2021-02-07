import { Component, State, Element, Host, h } from '@stencil/core';
import { IPanelManager } from './types';
import Draggable from "../../util/draggable";
import { guid, array2Hierarchy, delay } from "../../util/core";
import { broadcast } from '../../global/Broadcast';
import { DateEx } from '../../model/DateEx';

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
        panels: array2Hierarchy<IPanelManager.Config>([], item => item.windowId, item => item.callerWindowId, { windowId: '-1' } ),
    };

    private openPanelSubscription = broadcast.on('panel:init', (config: Partial<IPanelManager.Config>) => {
        const { windowId } = config;
        if (windowId && this.state.panels.valueMap[windowId]) {
            // focus to existing window
        } else {
            this.createNewWindow(config);
        }
        this.state.activePanelId = windowId;
    });

    private panelActionSubscription = broadcast.on('panel:action', ({ id, type }: IPanelManager.BasicPanelAction) => {
        switch(type) {
            case 'MINIMIZE':
                break;
            case 'CLOSE':
                this.closeWindows(id);
                break;
        }
    });

    disconnectedCallback() {
        this.openPanelSubscription.unsubscribe();
        this.panelActionSubscription.unsubscribe();
    }

    private closeWindows = (id: string) => {
        const valueMap = this.state.panels.valueMap;
        const ids = this.state.panels.getChildIds(id).reverse();
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
        const id = config.windowId ?? guid();
        if (config.componentProps) {
            config.componentProps['onClose'] = () => this.closeWindows(id);
            Object.entries(config.componentProps).forEach(([key, value]) => $elem[key] = value);
        }

        const $cmp = $elem;
        if (containerConfig) {
            const panelContainer = document.createElement('div');
            if (containerConfig.customHeader) {
                panelContainer.innerHTML = `<div class='content pe'></div>`;
            } else {
                panelContainer.innerHTML = `
                    <div class='inner ${containerConfig.fixedPosition ? 'fixed' : ''}'>
                        <div class='header pe no-select'>
                            <h4> ${containerConfig.title || 'New Window'} </h4>
                            ${!containerConfig.hideMinimize ? '<div class="minimize">_</div>' : ''}
                            ${!containerConfig.hideClose ? '<div class="close">✖</div>' : ''}
                        </div>
                        <div class='content pe'></div>
                    </div>`;                
            }
            panelContainer.querySelector('.content.pe').appendChild($elem);
            panelContainer.className = `panel-container ${containerConfig.theme || 'blue-theme'}`;
            panelContainer.dataset.windowId = id;

            $elem = panelContainer;
            
            if (containerConfig.mouseEvent) {
                const { x, y } = containerConfig.mouseEvent;
                $elem.style.left = x + 'px';
                $elem.style.top = y + 'px';
            }

            if (containerConfig.fixedPosition && containerConfig.position) {
                const pos = Object.entries(containerConfig.position);
                pos.forEach(([key, value]) => {
                    $elem.style[key] = typeof value !== 'string' ? (value + 'px') : value;
                });
            }
        }
        
        $cmp.dataset.componentId = id;
        this.$elem.appendChild($elem);

        if (containerConfig) {
            setTimeout(() => {

                const header = $elem.querySelector<HTMLElement>(containerConfig.customHeader || '.inner div.header.pe');

                if (header) {
                    const minimizeBtn = header.querySelector<HTMLElement>('.minimize');
                    if (minimizeBtn) minimizeBtn.onclick = () => broadcast.emit('panel:action', { id, type: 'MINIMIZE' });
                    const closeBtn = header.querySelector<HTMLElement>('.close');
                    if (closeBtn) closeBtn.onclick = () => broadcast.emit('panel:action', { id, type: 'CLOSE' });                
                }
    
                if (!containerConfig.fixedPosition) {
                    new Draggable($elem, header);
                }
    

            }, 1000)
        }

        if (containerConfig && containerConfig.initState !== 'hide') {
            setTimeout(() => $elem.classList.add(containerConfig.initState || 'show'), 100);
        }

        const windowConfig: IPanelManager.Config = {
            ...config,
            elem: $elem,
            component: $cmp,
            windowId: id,
            createdAt: new DateEx(),
        }

        $elem['windowConfig'] = windowConfig;

        this.state.panels.add({
            id: windowConfig.windowId,
            parent: config.linkWithCaller ? this.state.panels.valueMap[config.callerWindowId] : undefined,
            item: windowConfig,
            childs: []
        });
        
        if (config.panelHook) {
            config.panelHook(windowConfig);
        }
        
        // window['panels'] = this.state;
        // this.state.panels[windowConfig.windowId] = windowConfig;
    }

    render() {
        return (<Host></Host>);
    }
}