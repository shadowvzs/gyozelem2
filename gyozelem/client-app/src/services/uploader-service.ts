import { request } from "./request";
import FSObject, { FSTypeEnum, FSStatusEnum } from "../model/FSObject";
import { delay } from "../util/core";
import { createStore } from "@stencil/store";
import { IUploader } from "../components/uploader/types";
import { broadcast } from "../global/Broadcast";

const defaultStore: IUploader.State = {
    progress: [],
    miniMode: false,
    status: 'HIDDEN'
};

export const store = createStore(defaultStore);
const FILE_SELECT_TIMEOUT = 5 * 60 * 1000;

export class UploadService {

    private request = request;
    private MAX_CHUNK_SIZE = 1024 * 1024;
    private QUEUE_SIZE = 0;
    private QUEUE_MAX_SIZE = 4;
    private isAborted = false;
    private store = store;
    private uploadSubscription = broadcast.on('upload:init', (data: IUploader.Config) => {
        this.upload(data);
    })

    private endpoints = {
        create: () => `/api/fsobjects`,
        uploadChunk: (id: string) => `/api/fsobjects/${id}/uploadchunk`,
        uploadComplete: (id: string) => `/api/fsobjects/${id}/uploadcomplete`
    }

    public $inputContainer: HTMLDivElement;

    public dispose = () => { 
        this.uploadSubscription.unsubscribe();
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
            accept = '',
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

    /*
    private addFilesListener = (e: CustomEvent) => this.prepareFiles(e.detail as File[]);

    private prepareFiles = (files: File[]) => {
        files.forEach((file) => this.prepareFile(file));
        if (['START', 'UPLOADING'].indexOf(this.store.get('status')) < 0) {
            this.store.set('status', 'START');
        }
    }

    private setFileProgressListener = (e: CustomEvent) => {
        const { file, chunkSize } = e.detail as { file: File, chunkSize: number };
        this.setFile(file, chunkSize);
    }

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
        if (this.QUEUE_SIZE < 1) this.resetProgress();
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
        
        if (currentItem.nrOfChunks > 1) {
            this.QUEUE_SIZE--;
        }

        if (currentItem.nrOfChunks === (failedChunksLen + currentItem.uploadedChunks.length)) {
            currentItem.status = failedChunksLen ? 'ERROR' : 'DONE';
            if (currentItem.status === 'DONE') {
                try {
                    if (currentItem.nrOfChunks > 1) {
                        const updatedFs = await this.request.send<FSObject>(this.endpoints.uploadComplete(currentItem.id));
                        Object.assign(currentItem.entity, updatedFs.data);
                    }
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

                if (isSimpleUpload) { 
                    fsObject.status = FSStatusEnum.OK;
                    fsObject.url = await this.fileToBase64(progress.file); 
                }

                const response = await this.request.send<FSObject>(this.endpoints.create(), { data: fsObject, method: 'POST' });
             
                if (isSimpleUpload) {
                    progress.entity = response.data;
                    progress.id = response.data.id;
                    this.updateProgress(i, { 
                        progress,
                        index: i,
                        blob: null,
                        size: progress.size,
                    } as IUploader.Chunk);
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
        return entities;
    }    
}