import FSObject, { FSTypeEnum, IFSObject } from "../model/FSObject";
import { CrudService } from "./crudService";
import { broadcast } from "../global/Broadcast";


export class FileService extends CrudService<IFSObject> {

    constructor(public panelElem?: HTMLDivElement) {
        super(FSObject, '/api/fsobjects');
    }

    public onUpload = (parentId?: string) => {
        broadcast.emit('upload:init', {
            parentId: parentId,
            multiple: true
        });
    }

    public onBulkDelete = (ids: string[]) => {
        if (!confirm("Are you sure?")) { return; }
        this.bulkDeletePromise(ids);
    }

    public onBulkMove = async (target: FSObject, selectedItems: FSObject[]) => {
        if (selectedItems.length === 0) { return console.info('No changes, target folder same than the source folder'); }
        try {
            await this.bulkUpdatePromise(selectedItems.map(x => (x.parentId = target.id, x) ));
            this.selectedIds = [];
            broadcast.emit('notify:send', { type: 'success', message: `"${selectedItems.length}" item was moved into "${target.name}"` });

        } catch (err) {
            broadcast.emit('notify:send', { type: 'error', message: err });
        };
    }

    public download = (item: FSObject) => {
        if (item.type === FSTypeEnum.FOLDER) {
            // we don't download yet the folders because we will do in future with zip if needed
        } else {
            const a = document.createElement('a');
            a.href = item.url;
            a.download = item.metaData.filename;
            a.style.cssText=`position:absolute;opacity: 0;`
            document.body.appendChild(a);
            a.click();
            a.remove();
        }
    }
}

// export default FileExplorer;