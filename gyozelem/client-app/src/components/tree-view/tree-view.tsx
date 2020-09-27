
import { Component, Prop, Host, h } from '@stencil/core';
import { ITreeView } from './types';
import externalDependencies from "./dependencies";
import { IArrayValueMap, ITreeObject, TreeKey } from "../../core/util/core";

const { array2TreeMap, getPath } = externalDependencies;

@Component({
    tag: 'tree-view',
    styleUrl: 'tree-view.css',
    shadow: true
})

export class TreeView<T = any> {
    
    @Prop()
    config: ITreeView.Config;

    public treeMap: IArrayValueMap<ITreeObject<T>>;

    private treeRender = (childs: ITreeObject<T>[], path: TreeKey[]) => {

        const {
            renderItem,
            onSelect
        } = this.config;
        
        if (!childs || !childs.length) { return undefined; }
        const activeId = path.pop();

        return (
            <ul>
                {childs.map(child => {

                    const isActive = activeId === child.id;
                    const hasChilds = child && child.childs && child.childs.length > 0;

                    return (
                        <li> 
                            <span onClick={() => onSelect(isActive ? child.parent.id : child.id)} style={{ display: 'flex' }}>
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
        console.log(list, getRootItem())
        const treeMap = array2TreeMap(list, getId, getParentId, getRootItem());

        return (
            <Host>
                {treeMap && this.treeRender(
                    treeMap.valueMap[rootId].childs, 
                    getPath(treeMap, activeId, rootId)
                )}
            </Host>
        );
    }
}
