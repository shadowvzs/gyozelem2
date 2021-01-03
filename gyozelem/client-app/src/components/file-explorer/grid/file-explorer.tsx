import { Component, Element, Host, JSX, h } from '@stencil/core';
import { globalStore } from '../../../global/stores';
import FSObject, { FSTypeEnum, rootFolder } from '../../../model/FSObject';
import { UserRank } from '../../../model/User';
import { FileExplorerController } from '../controller';

@Component({
    tag: 'file-explorer',
    styleUrl: 'file-explorer.css',
    shadow: true
})

export class FileExplorer {

    private controller: FileExplorerController;

    @Element() el: HTMLDivElement;

    private onClick = (item: FSObject) => {
        if (item.type === FSTypeEnum.FOLDER) {
            this.controller.setActiveFolder(item.id);
        } else {
            if (item.type === FSTypeEnum.AUDIO) {
                this.controller.openAudioPlayer([item]);
            } else if (item.type === FSTypeEnum.IMAGE) {
                this.controller.openSlider(item);
            }
        }
    }

    componentWillLoad() {
        this.controller = new FileExplorerController(this.el);
        if (!this.controller) { return; }
        this.controller.loadAllFolders();
    }

    disconnectedCallback() {
        this.controller.dispose();
        console.info('removed the explorer from dom')
    }

    renderTreeItem = (item: FSObject, isActive?: boolean) => {
        return (
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <fs-icon 
                    singlelinelabel
                    name={isActive ? 'FolderOpen' : 'Folder'} 
                    color='active' 
                    fs={item} 
                    label={item.name}
                    size='small' 
                    align='right' />
            </div>
        )
    };   

    renderBreadcrumb = () => {
        const { 
            fsStore,
            setActiveFolder,
        } = this.controller;
        let { activeId, mappedList } = fsStore.state;
        const list: JSX.Element[] = [];
        
        let folder = mappedList.valueMap[activeId];
        if (folder) {
            do {
                list.push(<li onClick={() => setActiveFolder(folder.id)}>{folder.name}</li>);
                folder = mappedList.valueMap[folder.parentId];
            } while (folder);
        }
        
        list.push(<li onClick={() => setActiveFolder(rootFolder.id)}>{rootFolder.name}</li>);

        return (<nav><ul>{list.reverse()}</ul></nav>);
    }

    renderHeader = () => {
        const { 
            fsStore,
            setActiveFolder,
            openAddFolderModal,
            onUpload,
            onBulkDelete,
            onBulkMove,
            toggleTreeview,
        } = this.controller;

        const {
            selectAll,
            unSelectAll,
            selectedIds,
            items
        } = this.controller.service;
        const { activeId, mappedList, isActiveTreeview } = fsStore.state;
        const isRoot = activeId === rootFolder.id;
        const parentId = !isRoot && mappedList.valueMap[activeId].parentId;
        const user = globalStore.get('user');
        const isWritable = user && user.rank > UserRank.Editor;

        return (
            <div class='addressbar'>
                <span key='tree-toggle'>
                    <fs-icon 
                        name='FolderTree' 
                        width="18" 
                        height="18" 
                        onClick={toggleTreeview} 
                        color={isActiveTreeview ? 'active' : 'default'} 
                    />
                </span>
                {!isRoot && (
                    <span title="Home folder" key='home'>
                        <fs-icon name='Home' width="18" height="18" onClick={() => setActiveFolder(rootFolder.id)} />
                    </span>
                )}
                {!isRoot && parentId && (
                    <span key='up'>
                        <fs-icon name='Up' width="18" height="18" onClick={() => setActiveFolder(parentId)} />
                    </span>
                )}
                {isWritable && (
                    <span key='create' onClick={() => openAddFolderModal()}>
                        <fs-icon name='AddIntoFolder' width="22" height="22" />
                    </span>
                )}
                {isWritable && (
                    <span key='upload' onClick={() => onUpload()}>
                        <fs-icon name='Upload' width="18" height="18" />
                    </span>
                )}
                {isWritable && selectedIds.length < items.length && (
                    <span key='select-all'>
                        <fs-icon name='Checked' width="18" height="18" onClick={selectAll} />
                    </span>
                )}
                {isWritable && selectedIds.length > 0 && (
                    <span key='unselect-all'>
                        <fs-icon name='Unchecked' width="18" height="18" onClick={unSelectAll} />
                    </span>
                )}
                {isWritable && selectedIds.length > 0 && (
                    <span key='bulk-move'>
                        <fs-icon name='Move' width="18" height="18" onClick={onBulkMove} />
                    </span>
                )}
                {isWritable && selectedIds.length > 0 && (
                    <span key='bulk-delete'>
                        <fs-icon name='Delete' width="18" height="18" onClick={onBulkDelete} />
                    </span>
                )}                
                {this.renderBreadcrumb()}

            </div>
        );
    }

    renderContent() {
        const { 
            onContextMenu,
            onNameChange,
            service,
        } = this.controller;

        const {
            isSelected,
            toggleSelect,
        } = service;


        const items: FSObject[] = service.items.sort((a, b) => {
            if (a.type === FSTypeEnum.FOLDER) {
                return -1;
            } else if (b.type === FSTypeEnum.FOLDER) {
                return 1;
            }
            return 0;
        });

        // sort(items, 'name', 'ASC');

        return (
            <div class='content-list' onContextMenu={onContextMenu}>
                {/* this.service.isLoading ? 'aaa': 'bbb' */}
                {items.map(x => (
                    <fs-icon 
                        fs={x} 
                        size='big' 
                        align='bottom'
                        editable 
                        key={x.id} 
                        clickHandler={this.onClick} 
                        onContextMenu={onContextMenu}
                        onTitleChange={onNameChange}
                        isSelected={isSelected}
                        color='active'
                        selectHandler={(item) => toggleSelect(item.id)}
                    />
                ))}
            </div>
        );
    }

    render() {
        const { 
            fsStore,
            treeConfig,
        } = this.controller;

        const { list, mappedList } = fsStore.state;
        if (!list || !mappedList) {
            return undefined;
        }

        return (
            <Host>
                {this.renderHeader()}
                <div class='main-box'>
                    <div class='tree-view-wrapper' style={{ maxWidth: fsStore.get('isActiveTreeview') ? '250px' : '0' }}>
                        <div>
                            <tree-view config={treeConfig(this.renderTreeItem)} />
                        </div>                        
                    </div>
                    {this.renderContent()}
                </div>
            </Host>
        );
    }
}
