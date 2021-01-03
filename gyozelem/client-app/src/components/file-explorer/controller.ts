import { JSX } from '@stencil/core';
import { createStore } from "@stencil/store";
import { broadcast } from '../../global/Broadcast';
import { globalStore } from '../../global/stores';
import FSObject, { FolderSelectorProps, FSStatusEnum, FSTypeEnum, rootFolder } from '../../model/FSObject';
import { UserRank } from '../../model/User';
import { FileService } from "../../services/file-service";
import { array2ArrayMap, IArrayValueMap } from '../../util/core';

interface State {
    activeId: string;
    list: FSObject[];
    mappedList?: IArrayValueMap<FSObject>;
    sort: [keyof FSObject, 'ASC' | 'DESC'];
    isActiveTreeview: boolean;
}

const defaultStore: State = {
    activeId: rootFolder.id,
    list: [],
    sort: ['name', 'ASC'],
    isActiveTreeview: false
};

export class FileExplorerController {

    public fsStore = createStore(defaultStore);

    public service = new FileService();

    constructor(public panelElem?: HTMLDivElement) {
        if (panelElem) {
            this.service.addCacheItem(rootFolder);
            this.setActiveFolder(rootFolder?.id);
        }

        this.service.afterAdded = this.afterAdded;
        this.service.afterModified = this.afterModified;
        this.service.afterDeleted = this.afterDeleted;
    }

    public toggleTreeview = () => {
        this.fsStore.set('isActiveTreeview', !this.fsStore.get('isActiveTreeview'));
    }

    public openAddFolderModal = (event?: MouseEvent, parentId?: string) => {
        const { activeId } = this.fsStore.state;
        const data = { 
            componentTag: 'folder-detail', 
            containerConfig: { mouseEvent: event, title: 'New folder'},
            componentProps: { 
                item: new FSObject({ 
                    type: FSTypeEnum.FOLDER, 
                    parentId: parentId || activeId,
                    size: 0,
                    flag: 0,
                }),
                minimal: true,
                onSuccess: this.service.savePromise
            },
            linkWithCaller: true, 
            callerWindowId: this.panelElem.dataset.componentId
        };
        broadcast.emit('panel:init', data);
    }

    public openSlider = (item: FSObject) => {
        const images = this.service.items.filter(x => x.type === FSTypeEnum.IMAGE);
        const panelConfig = {
            componentTag: 'slider-container', 
            containerConfig: { 
                title: 'Slider',
                hideHeader: true,
                fixedPosition: true,
                position: {
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0
                }
            },
            componentProps: {
                config: {
                    items: images,
                    index: 0
                }
            }
        }
        const itemIdx = item ? images.findIndex(x => x.id === item.id) : 0;
        if (itemIdx > 0) { panelConfig.componentProps.config.index = itemIdx; }
        broadcast.emit('panel:init', panelConfig);
    };

    public openFolderPickerModal = (event?: MouseEvent, config?: FolderSelectorProps): Promise<{target: FSObject, title?: string }> => {
        return new Promise((resolve, reject) => {
            const { activeId } = this.fsStore.state;
            const data = { 
                componentTag: 'folder-select', 
                containerConfig: { mouseEvent: event, title: 'Select target folder'},
                componentProps: {
                    initFolderId: activeId,
                    onSuccess: resolve,
                    buttonName: 'Select',
                    ...config
                },
                onClose: () => reject(),
                linkWithCaller: true, 
                callerWindowId: this.panelElem.dataset.componentId
            };
            broadcast.emit('panel:init', data);
        });
    }

    public openAudioPlayer = (items: FSObject[]) => broadcast.emit('panel:init', { 
        componentTag: 'audio-player', 
        containerConfig: { 
            title: 'Audio Player',
            customHeader: '.header',
            hideHeader: true,
        },
        componentProps: {
            config: { 
                autoplay: true,
                list: items,
            }
        }
    });

    public onNameChange = (newName: string, item: FSObject) => {
        item.name = newName;
        return this.service.updatePromise(item);
    }

    public onUpload = (parentId?: string) => {
        this.service.onUpload(parentId || this.fsStore.state.activeId);
    }

    public onBulkDelete = () => {
        return this.service.onBulkDelete(this.service.selectedIds);
    }

    public onBulkMove = async (event: MouseEvent) => {
        const { target } = await this.openFolderPickerModal(event)
        const selectedItems = this.service.selectedItems;
        return this.service.onBulkMove(target, selectedItems);
    }

    public onContextMenu = (event: Event, item?: FSObject) => {
        broadcast.emit('contextMenu:open', { 
            menu: this.actionMenu, 
            item: item ?? this.service.getCacheItem(this.fsStore.get('activeId')), 
            event 
        });
    }

    public treeConfig = (
        itemRender: (item: FSObject, isActive?: boolean) => JSX.Element,
    ) => {
        const { activeId, list } = this.fsStore.state;
        return {
            activeId: activeId,
            list: list,
            rootId: rootFolder.id,
            renderItem: itemRender,
            getId: (item: FSObject) => item.id,
            getParentId: (item: FSObject) => item.parentId,
            getRootItem: () => rootFolder,
            onSelect: this.setActiveFolder,
        }
    } 

    // root id: 00000000-0000-0000-0000-000000000000	
    public loadAllFolders = async () => {
        const folderList = (await this.service.getList({ type: FSTypeEnum.FOLDER }, { noList: true })).items;
        this.fsStore.set('list', folderList);
        this.fsStore.set('mappedList', array2ArrayMap(folderList));
        return folderList;
    }

    public loadContent = async (filters?: { parentId: string } & Record<string, string>) => {
        if (!filters) { filters['parentId'] = this.fsStore.get('activeId') ?? rootFolder?.id; }
        const response = await this.service.getList(filters);
        return response;
    }

    public afterAdded = (entity: FSObject): void => {
        const activeId = this.fsStore.state.activeId;
        const alreadyInItems = this.service.items.some(x => x.id === entity.id);

        if (alreadyInItems && entity.parentId !== activeId) {
            this.service.items = this.service.items.filter(x => x.id !== entity.id);
        } else if (!alreadyInItems && entity.parentId === activeId) {
            this.service.items = [...this.service.items, entity];
        }

        if (entity.type === FSTypeEnum.FOLDER) {
            const map = this.fsStore.get('mappedList');
            map.add(entity);

            const list  = this.fsStore.state.list;
            const isItemExist = list.some(x => x.id === entity.id);
            if (!isItemExist) {
                this.fsStore.set('list', [...list, entity]);
            }
        }
    }

    public afterModified = (entity: FSObject): void => {
        if (entity.type === FSTypeEnum.FOLDER) {
            const list  = this.fsStore.state.list;
            const idx = list.findIndex(x => x.id === entity.id);
            if (idx !== -1) {
                list[idx] = entity;
                this.fsStore.set('list', [...list]);
            }
            const map = this.fsStore.get('mappedList');
            const mappedItem = map.valueMap[entity.id];
            if (mappedItem) {
                Object.assign(mappedItem, entity);
            }
        }

        const alreadyInItems = this.service.items.some(x => x.id === entity.id);
        const activeId = this.fsStore.get('activeId');
        if (entity.parentId !== activeId && alreadyInItems) {
            this.service.items = [...this.service.items.filter(x => x.id !== entity.id)];
        } else if (entity.parentId === activeId && !alreadyInItems) {
            this.service.items = [...this.service.items, entity];
        }
    }

    public afterDeleted = (entity: FSObject): void => {
        if (entity.type === FSTypeEnum.FOLDER) {
            const list  = this.fsStore.state.list;
            const idx = list.findIndex(x => x.id === entity.id);
            if (idx !== -1) {
                list[idx].$deleted = true;
                this.fsStore.set('list', list.filter(x => x.id === entity.id));
            }
            const map = this.fsStore.get('mappedList');
            const mappedItem = map.valueMap[entity.id];
            if (mappedItem) {
                map.remove(entity.id)
                Object.assign(mappedItem, { $deleted: true });
            }   
        }

    }

    public setActiveFolder = async (folderId: string) => {
        if (!folderId) { return; }
        this.service.unSelectAll();
        await this.loadContent({ parentId: folderId });
        this.fsStore.set('activeId', folderId);        
    }
    
    public get actionMenu() {
        const user = globalStore.get('user');
        const isWriteable = user && user.rank >= UserRank.Editor;

        return {
            create: {
                action: (event: MouseEvent, item: FSObject) => { this.openAddFolderModal(event, item.id); },
                icon: 'Add',
                label: 'Új mappa',
                visible: (item: FSObject) => isWriteable && item.type === FSTypeEnum.FOLDER && item.status === FSStatusEnum.OK,
                // enable: (item: FSObject) => item.type === FSTypeEnum.FOLDER && item.status === FSStatusEnum.OK,
            },
            upload: {
                action: (event: MouseEvent, item: FSObject) => this.onUpload(item.id),
                icon: 'Upload1',
                label: 'Feltölt',
                visible: (item: FSObject) => isWriteable && item.type === FSTypeEnum.FOLDER && item.status === FSStatusEnum.OK,
                enable: (item: FSObject) => item.flag !== 1,
            },
            move: {
                action: async (event: MouseEvent, item: FSObject) => {
                    // inputProps: { placeholder: 'Type the name' },
                    const { target } = await this.openFolderPickerModal(event)
                    if (target.id === item.parentId) { console.info('No changes, target folder same than the source folder'); }
                    try {
                        item.parentId = target.id;
                        await this.service.savePromise(item);
                        broadcast.emit('notify:send', { type: 'success', message: `"${item.name}" was moved into "${target.name}"` });

                    } catch (err) {
                        broadcast.emit('notify:send', { type: 'error', message: err });
                    }                    
                },
                icon: 'Move',
                label: 'Áthelyez',
                visible: (item: FSObject) => isWriteable && item.status === FSStatusEnum.OK && item.id !== rootFolder.id,
                enable: (item: FSObject) => item.flag !== 1,
            },
            delete: {
                action: (event: MouseEvent, item: FSObject) => {
                    if (!confirm("Are you sure?")) { return; }
                    this.service.deletePromise(item.id);
                },
                icon: 'Delete',
                label: 'Töröl',
                visible: (item: FSObject) => isWriteable && item.status === FSStatusEnum.OK && item.id !== rootFolder.id,
                enable: (item: FSObject) => item.id !== this.fsStore.state.activeId && item.flag !== 1,
            },
            download: {
                action: (event: MouseEvent, item: FSObject) => this.service.download(item),
                icon: 'Download',
                label: 'Letölt',
                visible: (item: FSObject) => item.status === FSStatusEnum.OK && item.id !== rootFolder.id && item.type !== FSTypeEnum.FOLDER,
                // enable: (item: FSObject) => item.type === FSTypeEnum.FOLDER && item.status === FSStatusEnum.OK,
            }
        }
    }

    public dispose = () => {
        this.service.dispose();
    }
}

// export default FileExplorer;