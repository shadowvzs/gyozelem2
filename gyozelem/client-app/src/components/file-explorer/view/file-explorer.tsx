import { Component, Element, Host, JSX, h } from '@stencil/core';
import FSObject, { FSTypeEnum, rootFolder } from '../model/FSObject';
import { sort } from "../../../core/util/core";
import { FileExplorerService } from "../service";
import { contextMenu } from '../../context-menu';
import { store } from '../model/store';
import { upload } from '../../uploader';

@Component({
    tag: 'file-explorer',
    styleUrl: 'file-explorer.css',
    shadow: true
})

export class FileExplorer {

    private store = store;

    private service: FileExplorerService = new FileExplorerService();

    @Element() el: HTMLElement;


    private setActiveFolder = async (folderId: string) => {
        if (!folderId) { return; }
        // do query for backend with await
        this.service.setActiveFolder(folderId);
    }

    private onClick = (item: FSObject) => {
        if (item.type === FSTypeEnum.FOLDER) {
            this.setActiveFolder(item.id);
        } else {
            // open detail modal
        }
    }

    componentWillLoad() {
        if (!this.service) { return; }
        this.service.loadAllFolders();
    }

    disconnectedCallback() {
        console.log('removed the explorer from dom')
    }

    private openAddFolderModal = () => {
        const { activeId } = this.store.state;
        const data = { 
            componentTag: 'folder-view', 
            containerConfig: { title: 'test'},
            componentProps: { 
                item: new FSObject({ 
                    type: FSTypeEnum.FOLDER, 
                    parentId: activeId,
                    size: 0,
                    flag: 0,
                }),
                minimal: true,
                onSuccess: this.service.save
            },
            linkWithCaller: true, 
            callerWindowId: this.el.dataset.componentId
        };

        const event = new CustomEvent('windowRegistry', { detail: data });
        document.dispatchEvent(event);
    }

    private onUpload = () => {
        upload({
            parentId: this.store.state.activeId,
            multiple: true
        });
    }

    private treeConfig() {
        const { activeId, list } = this.store.state;

        return {
            activeId: activeId,
            list: list,
            rootId: rootFolder.id,
            renderItem: (item: FSObject, isActive?: boolean) => (
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <fs-icon name={isActive ? 'FolderOpen' : 'Folder'} fs={item} size='small' align='right' />
                </div>
            ),
            getId: (item: FSObject) => item.id,
            getParentId: (item: FSObject) => item.parentId,
            getRootItem: () => rootFolder,
            onSelect: this.setActiveFolder,            
        }
    } 

    renderBreadcrumb = () => {
        let { activeId, mappedList } = this.store.state;
        const list: JSX.Element[] = [];
        
        let folder = mappedList.valueMap[activeId];
        if (folder) {
            do {
                list.push(<li onClick={() => this.setActiveFolder(folder.id)}>{folder.name}</li>);
                folder = mappedList.valueMap[folder.parentId];
            } while (folder);
        }
        
        list.push(<li onClick={() => this.setActiveFolder(rootFolder.id)}>{rootFolder.name}</li>);

        return (<nav><ul>{list.reverse()}</ul></nav>);
    }

    renderHeader = () => {

        const { activeId, mappedList } = this.store.state;
        const isRoot = activeId === rootFolder.id;
        const parentId = !isRoot && mappedList.valueMap[activeId].parentId;

        return (
            <div class='addressbar'>

                {!isRoot && (
                    <span title="Home folder" key='home'>
                        <fs-icon name='Home' width="18" height="18" onClick={() => this.setActiveFolder(rootFolder.id)} />
                    </span>
                )}
                {!isRoot && parentId && (
                    <span key='up'>
                        <fs-icon name='Up' width="18" height="18" onClick={() => this.setActiveFolder(parentId)} />
                    </span>
                )}
                <span key='create' onClick={() => this.openAddFolderModal()}>
                    <fs-icon name='AddIntoFolder' width="22" height="22" />
                </span>   
                <span key='upload' onClick={this.onUpload}>
                    <fs-icon name='Upload' width="18" height="18" />
                </span>
                {this.service.selectedIds.length < this.service.items.length && (
                    <span key='select-all'>
                        <fs-icon name='Checked' width="18" height="18" onClick={() => this.service.selectAll()} />
                    </span>
                )}
                {this.service.selectedIds.length > 0 && (
                    <span key='unselect-all'>
                        <fs-icon name='Unchecked' width="18" height="18" onClick={() => this.service.unSelectAll()} />
                    </span>
                )}
                {this.renderBreadcrumb()}

            </div>
        );
    }

    renderContent() {

        const { list, activeId } = this.store.state;
        const items: FSObject[] = [];

        if (activeId === rootFolder.id) {
            items.push(...list.filter(x => !x.parentId));
        } else {
            items.push(...list.filter(x => x.parentId === activeId));
        }

        sort(items, 'name', 'ASC');
        
        const menuList = [
            {
                label: 'Check this',
                callback: (a: any) => console.table(a),
                data: this.service.getCacheItem(activeId, undefined)
            }
        ]

        return (
            <div class='content-list' onContextMenu={contextMenu(menuList)}>
                { items.map(x => (
                    <fs-icon 
                        fs={x} 
                        size='big' 
                        align='bottom' 
                        editable 
                        key={x.id} 
                        clickHandler={this.onClick} 
                        isSelected={this.service.isSelected}
                        selectHandler={(item) => this.service.toggleSelect(item.id)}
                    />
                )) }
            </div>
        );
    }

    render() {
        const { list, mappedList } = this.store.state;
        if (!list || !mappedList) {
            return undefined;
        }

        return (
            <Host>
                {this.renderHeader()}
                <div class='main-box'>
                    <tree-view config={this.treeConfig()} />
                    {this.renderContent()}
                </div>
            </Host>
        );
    }
}
