import { store } from "./store";
import { IUploader } from "./types";
import { request } from "../../core/services/request";
import FSObject, { FSTypeEnum, FSStatusEnum } from "../file-explorer/model/FSObject";
import { delay } from "../../core/util/core";

const FILE_SELECT_TIMEOUT = 5 * 60 * 1000;

export class UploadService {

    private request = request;
    private MAX_CHUNK_SIZE = 1024 * 1024;
    private QUEUE_SIZE = 0;
    private QUEUE_MAX_SIZE = 4;
    private isAborted = false;
    private store = store;
//     private totalSize = 0;
//     private uploadedSize = 0;
//     private maxUpload = 4;
//     private uploadCount = 0;

    private endpoints = {
        create: () => `/api/fsobjects`,
        uploadChunk: (id: string) => `/api/fsobjects/${id}/uploadchunk`,
        uploadComplete: (id: string) => `/api/fsobjects/${id}/uploadcomplete`
    }

    public $inputContainer: HTMLDivElement;

    constructor() {
        document.addEventListener('upload', this.uploadHandler);
    }

    dispose = () => { document.removeEventListener('upload', this.uploadHandler); }

    private uploadHandler = (e: CustomEvent) => {
        this.upload(e.detail as IUploader.Config);
    }

    public upload = async (config?: IUploader.Config) => {
        if (!config.files) {
            config.files = await this.selectFiles(config || {});
        }
        config.files.forEach(f => this.prepareFile(f, config.parentId));
        const progressList = this.store.get('progress');
        this.uploadAllChunk(progressList);
    }

    private selectFiles = (config: IUploader.Config): Promise<File[]> => {
        const {
            accept = 'image/*',
            max,
            multiple = true,
            filter,
        } = config;

        let input: HTMLInputElement;

        const promise = new Promise<File[]>((resolve, reject) => {
            input = document.createElement('input');
            input.type = 'file';
            input.accept = accept;
            input.multiple = multiple;
            input.onchange = () => {
                let files = Array.from(input.files);
                if (filter) { files = files.filter(filter); }
                if (max && max > 0) { files = files.splice(0, max); }
                resolve(files);
            }
            input.click();

            setTimeout(() => reject(), FILE_SELECT_TIMEOUT);
        });

        setTimeout(() => {
            if (input) { input.remove(); }
        }, FILE_SELECT_TIMEOUT);

        return promise;
    }

    private addFilesListener = (e: CustomEvent) => this.prepareFiles(e.detail as File[]);

    private prepareFile = (file: File, parentId?: string) => {
        const progress = this.store.get('progress');
        progress.push({
            file: file,
            name: file.name,
            parentId: parentId,
            failedChunks: [],
            uploadedChunks: [],
            nrOfChunks: Math.ceil(file.size / this.MAX_CHUNK_SIZE),
            size: file.size,
            uploaded: 0,
            status: 'QUEUE'
        });
        this.store.set('progress', progress);
    }

    private prepareFiles = (files: File[]) => {
        files.forEach((file) => this.prepareFile(file));
        if (['START', 'UPLOADING'].indexOf(this.store.get('status')) < 0) {
            this.store.set('status', 'START');
        }
    }

    /*
    private setFileProgressListener = (e: CustomEvent) => {
        const { file, chunkSize } = e.detail as { file: File, chunkSize: number };
        this.setFile(file, chunkSize);
    }
    */

    private setFile(file: File, chunkSize: number) {
        const progress = this.store.get('progress');
        const idx = progress.findIndex(x => x.file === file);
        if (idx < 0) { return; }
        const p = progress[idx];
        if (chunkSize === -1) {
            p.uploaded = p.size;
            p.status = 'ERROR';
        } else {
            p.uploaded += chunkSize;
            p.status = (p.uploaded >= p.size) ? 'DONE' : 'UPLOADING';
        }

        if (p.status === 'DONE') { p.file = null; }
        
        progress[idx] = p;
        this.store.set('progress', progress);
        this.store.set('status', progress.some(x => x.status !== 'DONE' && x.status !== 'ERROR') ? 'UPLOADING' : 'DONE');
    }

    /*
    private setFilesProgressListener = (e: CustomEvent) => {
        this.setFiles(e.detail as File[]);
    }

    private setFiles(files: File[]) {
        files.forEach(this.addFile);
        store.set('status', 'START');
    }
    */

    private resetProgress = () => {
        const {
            progress
        } = this.store.state;

        progress.forEach(x => {
            x.file = null;
            if (['ERROR', 'DONE'].includes(x.status)) {
                x.status = 'SKIPPED';
            }
        });

        this.store.set('progress', progress);
        delay(1).then(() => {
            this.store.set('progress', []);
            this.store.set('status', 'HIDDEN');
        });
    }

    private endUpload = async () => {
        this.store.set('status', 'DONE');
        await delay(1.5);
        if (!this.QUEUE_SIZE) this.resetProgress();
    }

    public * getFileChunk(progress: IUploader.Progress) {
        const size: number = progress.size;
        const file = progress.file;
        let start: number = 0;
        let end: number = this.MAX_CHUNK_SIZE;
        let index = 1;
        while(start < size) {
            const blob = file.slice(start, end);
            yield ({ 
                progress,
                index,
                blob,
                size: blob.size,
            } as IUploader.Chunk);
            index++;
            start = end;
            end += Math.min(this.MAX_CHUNK_SIZE, size - end);
        }
    }

    private updateProgress = async (progressIndex: number, chunk: IUploader.Chunk, errorMsg?: string) => {
        const progress = this.store.get('progress');
        const currentItem = progress[progressIndex];
        currentItem.uploaded += chunk.size;
        currentItem[errorMsg ? 'failedChunks' : 'uploadedChunks'].push(chunk.index);
        const failedChunksLen = currentItem.failedChunks.length;
        this.QUEUE_SIZE--;

        if (currentItem.nrOfChunks === (failedChunksLen + currentItem.uploadedChunks.length)) {
            currentItem.status = failedChunksLen ? 'ERROR' : 'DONE';
            if (currentItem.status === 'DONE') {
                try {
                    const updatedFs = await this.request.send<FSObject>(this.endpoints.uploadComplete(currentItem.id));
                    Object.assign(currentItem.entity, updatedFs.data);
                    console.log('updated data: ', updatedFs);
                    currentItem.status = 'DONE'
                } catch (err) {
                    console.error(err);
                    currentItem.status = 'ERROR'
                }
            }
            if (progress.every(x => ['ERROR', 'SKIPPED', 'DONE'].includes(x.status))) {
                this.endUpload();
            }
        }

        this.store.set('progress', progress);
    }

    private fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const b64 = reader.result as string;
            resolve(b64.split(',').pop());
        };
        reader.onerror = error => reject(error);
    });

    public uploadAllChunk = async (progressList: IUploader.Progress[]) => {

        for (let i = 0; progressList[i]; i++) {
            const progress = progressList[i];
            if (!progress || progress.status === 'DONE' || progress.status === 'ERROR') { continue; }
            
            try {

                const fsObject = new FSObject({
                    name: progress.name,
                    parentId: progress.parentId,
                    status: FSStatusEnum.UPLOADING,
                    type: FSTypeEnum.UNKNOWN,
                    flag: 0,
                    size: progress.size,
                    extension: progress.name.split('.').pop(),
                    metaData: {
                        filename: progress.name,
                        extension: progress.name.split('.').pop(),
                    }
                });

                const isSimpleUpload = progress.size <= this.MAX_CHUNK_SIZE;

                if (isSimpleUpload) { fsObject.url = await this.fileToBase64(progress.file); }

                const response = await this.request.send<FSObject>(this.endpoints.create(), { data: fsObject, method: 'POST' });
             
                if (isSimpleUpload) {
                    progress.entity = response.data;
                    continue;
                }

                const resource = this.getFileChunk(progress);
                progress.entity = response.data;
                progress.id = response.data.id;

                while (true) {
                    const chunk = resource.next().value as IUploader.Chunk
                    if (!chunk) { break; }

                    const { size, blob, index } = chunk;
                    if (this.isAborted) { throw "Upload was aborted"; }
                    this.QUEUE_SIZE++;

                    const uploadChunkRequest = this.request.send<void>(this.endpoints.uploadChunk(progress.id), {
                        data: blob,
                        contentType: `application/octet-stream`,
                        header: {
                            'X-File-Index': index,
                            'X-File-MaxIndex': size,
                        },
                        method: 'POST',
                    });

                    if (this.QUEUE_SIZE === this.QUEUE_MAX_SIZE) {
                        await uploadChunkRequest;
                        await this.updateProgress(i, chunk);
                    } else {
                        uploadChunkRequest.then(() => {
                            this.updateProgress(i, chunk as IUploader.Chunk);
                        })
                        .catch(err => {
                            this.updateProgress(i, chunk as IUploader.Chunk, err);
                            progress.error = `Chunk upload failed for ${progress.name}, error message: ${err}`;
                        });
                    }
                }
            } catch(err) {
                progress.status = 'ERROR';
                progress.error = `Upload failed for ${progress.name}, error message: ${err}`;
            }                
        }

        const entities = progressList.filter(x => x.entity).map(x => x.entity);
        console.log(entities);
        return entities;
    }    
}

// import { fs } from '@core/FS';
// import { request } from '@core/Request';
// import { renderElem, build } from "@core/VDom";
// import { createStyles } from "@core/JSS";
// import { 
//     IRequest, 
//     IFS, 
//     IFileUploader
// } from "@typo";
// import { delay } from "@util/core";

// interface IContainerCmp {
//     ctrl: IFileUploader;
// }

// /**
//     FileUploader:
//     Upload the files: parellel with file chunks
// */

// interface IFileUploader {
//     onToggle: () => void;
// }

// class FileUploader implements IFileUploader {
//     private fs = fs;
//     private isAborted = false;
//     private totalSize = 0;
//     private uploadedSize = 0;
//     private maxUpload = 4;
//     private uploadCount = 0;
//     private progressList: IFileUploader.Progress[] = [];

//     private $container: HTMLDivElement;
//     private $fileContainer: HTMLElement;
//     private $maxFile: HTMLDivElement;
//     private $curFile: HTMLDivElement;
//     private $progressBar: HTMLDivElement;
//     private $status: HTMLDivElement;
//     private $fileList: HTMLDivElement;

//     public endpoints = {
//         fileUpload: '/api/fileSystem/_chunk',
//     };

//     constructor() {
//         this.$container = renderElem(ContainerCmp({ ctrl: this })) as HTMLDivElement;
//         document.body.appendChild(this.$container);
//     }

//     public async abortUploads() {
//         this.$status.textContent = 'Ended';
//         await delay(1);
//         this.resetProgress();
//         this.$container.classList.remove('show');
//     }

//     private resetProgress() {
//         this.totalSize = 0;
//         this.uploadedSize = 0;
//         this.$maxFile.textContent = '0';
//         this.$curFile.textContent = '0';
//         this.setProgressbar(0);
//         this.$status.dataset.value = '0';
//         this.progressList = [];
//         this.$fileList.innerHTML = '';
//     }

//     private preparePacket(chunk: IFS.Chunk, fileSize: number, parentId: string = "0"): IRequest.Config {
//         return {
//             data: chunk.data,
//             contentType: `application/octet-stream`,
//             header: {
//                 'X-File-Part': chunk.part,
//                 'X-File-Size': chunk.size.toString(),
//                 'X-File-Meta': JSON.stringify({ some: 1 }),
//                 'X-File-Base': JSON.stringify({
//                     name: chunk.name,
//                     endSize: fileSize,
//                     type: chunk.type,
//                     parentId: parentId,
//                 })
//             },
//             method: 'POST',
//         };
//     }

//     private setProgressbar(ratio: number) {
//         const percentage = Math.round((ratio - 1) * 100);
//         this.$progressBar.style.left = `${percentage}%`;
//         this.$status.dataset.value = (percentage + 100).toString();
//     }

//     private async updateProgress(progress: IFileUploader.Progress, size: number) {
//         progress.uploaded += size;
//         this.uploadedSize += size;
//         this.setProgressbar(this.uploadedSize / this.totalSize);
//         if (progress.uploaded === progress.size) {
//             const uploadedFile: number = 1 + +(this.$curFile.textContent as string);
//             const checkbox = this.$fileList.querySelector(`[data-index="${progress.index}"] .icon`);
//             if (checkbox) checkbox.classList.add('checked');
//             this.$curFile.textContent = uploadedFile.toString();
//             if (uploadedFile === this.progressList.length) this.endUpload();
//         }
//     }

//     private getFileListDom(files: File[]): DocumentFragment {
//         const fragment = document.createDocumentFragment();
//         files.forEach((f, i) => fragment.appendChild(renderElem(FileItemCmp({ index: i, name: f.name }))));
//         return fragment;
//     }

//     private startUpload(files: File[]) {
//         this.resetProgress();
//         this.$status.textContent = 'Uploading';
//         this.$container.classList.add('show');
//         this.totalSize = files.reduce((t, f) => t + f.size, 0);
//         this.uploadedSize = 0;
//         this.$curFile.textContent = '0';
//         this.$maxFile.textContent = files.length.toString();
//         this.$fileList.appendChild(this.getFileListDom(files));
//     }

//     onToggle = () => {
//         this.$container.classList.toggle('fu-mini');
//     }

//     private async endUpload() {
//         this.$status.textContent = 'Uploaded';
//         await delay(1.5);
//         if (!this.uploadCount) this.abortUploads();
//     }

//     public async chunkUpload(parentId?: string, accept?: string) {
//         if (this.uploadCount > 0) {
//             return console.error('Upload already start, please wait before you can upload again');
//         }
//         const files: File[] = await this.fs.openFile(accept);
//         if (!files.length) return;
//         this.startUpload(files);
//         let chunk: IFS.Chunk;
//         const fileEntries = files.entries();
//         let errors: string[] = [];
//         for (const [idx, file] of fileEntries) {
//             const progress = {
//                 index: idx,
//                 name: file.name,
//                 size: file.size,
//                 uploaded: 0,
//                 error: false
//             };
//             try {
//                 const resource = this.fs.readChunk(file);
//                 this.progressList.push(progress);
//                 while (chunk = resource.next().value as IFS.Chunk) {
//                     const size = chunk.size;
//                     if (this.isAborted) { throw "Upload was aborted"; }
//                     this.uploadCount++;
//                     const req = request.send(this.endpoints.fileUpload, this.preparePacket(chunk, file.size, parentId));
//                     if (this.uploadCount === this.maxUpload) {
//                         await req;
//                         this.updateProgress(progress, size);
//                         this.uploadCount--;
//                     } else {
//                         req.then(result => {
//                             this.updateProgress(progress, size);
//                             this.uploadCount--;
//                         })
//                         .catch(err => {
//                             this.updateProgress(progress, size);
//                             this.uploadCount--;
//                             this.progressList[idx].error = true;
//                             errors.push(`Chunk upload failed for ${file.name}, error message: ${err}`);
//                         });
//                     }
//                 }
//             } catch(err) {
//                 errors.push(`Upload failed for ${file.name}, error message: ${err}`);
//             }                
//         }
//         return this.progressList;
//     }
// }

// export const fileUploader = new FileUploader();
