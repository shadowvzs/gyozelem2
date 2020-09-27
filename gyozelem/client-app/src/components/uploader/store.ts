import { createStore } from "@stencil/store";
import { IUploader } from "./types";

const defaultStore: IUploader.State = {
    progress: [],
    miniMode: false,
    status: 'HIDDEN'
};

export const store = createStore(defaultStore);

// export const store = state;