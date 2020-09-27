import FSObject from "../file-explorer/model/FSObject";

export declare namespace IUploader {

    interface Progress {
        id?: string;
        file: File;
        name: string;
        size: number;
        error?: string;
        uploaded: number;
        parentId: string;
        nrOfChunks: number;
        failedChunks: number[];
        uploadedChunks: number[];
        status: 'QUEUE' | 'UPLOADING' | 'DONE' | 'ERROR' | 'SKIPPED';
        entity?: FSObject;
    }

    interface State {
        progress: Progress[];
        miniMode: boolean;
        status: 'START' | 'UPLOADING' | 'DONE' | 'HIDDEN';
    }

    interface Config {
        accept?: string;
        files?: File[];
        max?: number;
        multiple?: boolean;
        parentId?: string;
        filter?: (f: File) => boolean;
    }

    interface Chunk {
        progress: Progress;
        index: number;
        size: number;
        blob: Blob;
    }
}