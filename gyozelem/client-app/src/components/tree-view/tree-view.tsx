
import { Component, Prop, Host, h } from '@stencil/core';
import { ITreeView } from './types';
import { ITreeObject, TreeKey, array2Hierarchy, IHierarchyMap } from "../../util/core";

@Component({
    tag: 'tree-view',
    styleUrl: 'tree-view.css',
    shadow: true
})

export class TreeView<T = any> {
    
    @Prop()
    config: ITreeView.Config;

    public treeMap: IHierarchyMap<ITreeObject<T>>;

    private treeRender = (childs: ITreeObject<T>[], path: TreeKey[]) => {

        const {
            renderItem,
            onSelect,
            isEnabled
        } = this.config;
        
        if (!childs || !childs.length) { return undefined; }

        return (
            <ul>
                {childs.map(child => {
                    const isActive = path.includes(child.id);
                    const hasChilds = child && child.childs && child.childs.length > 0;
                    const enabled = !isEnabled || isEnabled(child);
                    const cb = enabled ? () => onSelect(isActive ? child.parent.id : child.id) : undefined;
                    return (
                        <li> 
                            <span class={isActive ? 'underline' : ''} onClick={cb} style={{ display: 'flex', opacity: enabled ? '1' : '0.5' }}>
                                {hasChilds ? <span class={'arrow ' + (isActive ? 'down' : 'right')} /> : <span class='arrow spacer' />}
                                { renderItem(child.item, isActive) }
                            </span>
                            {isActive && hasChilds && this.treeRender(child.childs || [], path)}
                        </li>
                    );
                })}  
            </ul>
        )
    };
    
    render() {
        const { activeId, rootId, getId, getParentId, getRootItem, list } = this.config;
        const treeMap = array2Hierarchy(list, getId, getParentId, getRootItem());
        const path = [...treeMap.getParentIds(activeId, rootId), activeId];
        return (
            <Host>
                {treeMap && this.treeRender(
                    treeMap.valueMap[rootId].childs, 
                    path
                )}
            </Host>
        );
    }
}
