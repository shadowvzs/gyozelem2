import { IUploader } from "./types";

export const upload = (config: IUploader.Config) => {
    const event = new CustomEvent('upload', { detail: config });
    document.dispatchEvent(event);
};