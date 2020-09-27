import FSObject, { FSTypeEnum, IFSObject, rootFolder } from "../model/FSObject";
import { CrudService } from "../../../core/services/crudService";
import { store } from '../model/store';
import { array2ArrayMap } from "../../../core/util/core";

export class FileExplorerService extends CrudService<IFSObject> {

    private store = store;

    constructor() {
        super(FSObject, '/api/fsobjects');
        this.addCacheItem(rootFolder);
    }

    // root id: 00000000-0000-0000-0000-000000000000	
    public loadAllFolders = async () => {

        const folderList = (await this.getList({ type: FSTypeEnum.FOLDER })).items;
        console.log(folderList)
        // this.getList()
        this.store.set('list', folderList);
        this.store.set('mappedList', array2ArrayMap(folderList));
        return folderList;
    }

    public loadContent = async (filters: { folderId: string } & Record<string, string>) => {
        const response = await this.getList(filters);
        return response;
    }

    public setActiveFolder = (folderId: string) => {
        // loadContent
        this.store.set('activeId', folderId);        
    }

    public save = async (item: FSObject) => {
        const result = await super.save(item);
        if (result.type === FSTypeEnum.FOLDER) {
            const map = this.store.get('mappedList');
            const mappedItem = map.valueMap[result.id];
            if (mappedItem) {
                Object.assign(mappedItem, result);
                this.store.set('list', [...this.store.get('list')]);
            } else {
                map.add(result);
                this.store.set('list', [...this.store.get('list'), result]);
            }
        }
        return result;
    }
}

// export default FileExplorer;