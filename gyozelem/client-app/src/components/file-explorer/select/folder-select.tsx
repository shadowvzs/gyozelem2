
import { Component, Element, Prop, Host, h } from '@stencil/core';
import { IHierarchyMap, ITreeObject } from "../../../util/core";
import { FSObject, FolderSelectorProps } from '../../../model/FSObject';
import { FileExplorerController } from '../controller';

@Component({
    tag: 'folder-select',
    styleUrl: 'folder-select.css',
    shadow: true
})

export class TreeView<T = any> {

    private controller: FileExplorerController;

    @Element() el: HTMLDivElement;

    @Prop()
    initFolderId: FolderSelectorProps['initFolderId'];

    @Prop()
    onSuccess: FolderSelectorProps['onSuccess'];

    @Prop()
    inputProps?: FolderSelectorProps['inputProps'];

    @Prop()
    onClose: FolderSelectorProps['onClose'];

    @Prop()
    buttonName: FolderSelectorProps['buttonName'] = 'Select';

    public treeMap: IHierarchyMap<ITreeObject<T>>;

    componentWillLoad() {
        this.controller = new FileExplorerController(this.el);
        if (!this.controller) { return; }
        this.controller.loadAllFolders();
        this.controller.setActiveFolder(this.initFolderId);
    }

    disconnectedCallback() {
        this.controller.dispose();
        console.info('removed the folder picker from dom');
    }

    private onSelect = () => {
        if (!this.onSuccess) { console.error('Missing success handler'); }
        const activeId = this.controller.fsStore.get('activeId');
        const item = this.controller.service.getCacheItem(activeId);
        const newTitle = this.el.querySelector<HTMLInputElement>('input')?.value;
        this.onSuccess({ target: item, title: newTitle })
        this.onClose();
    }

    renderTreeItem = (item: FSObject, isActive?: boolean) => {
        return (
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <fs-icon 
                    singlelinelabel
                    name={isActive ? 'FolderOpen' : 'Folder'} 
                    isActive={isActive}
                    color='active' 
                    fs={item} 
                    label={item.name}
                    size='small' 
                    align='right' />
            </div>
        )
    };   

    render() {
        const { 
            fsStore,
            treeConfig,
        } = this.controller;
        const { list, mappedList, activeId } = fsStore.state;
        if (!list || !mappedList || !activeId) {
            return undefined;
        }

        return (
            <Host>
                <section>
                    <main>
                        <tree-view config={treeConfig(this.renderTreeItem)} />                    
                    </main>
                    <footer>
                        {this.inputProps && <span><input type='text' required {...this.inputProps} /></span> }
                        <span><button onClick={this.onSelect}> {this.buttonName} </button></span>
                    </footer>
                </section>
            </Host>
        );
    }
}