import { createStore } from "@stencil/store";
import { IFileExplorer } from "../types/types";
import { rootFolder } from "./FSObject";

const defaultStore: IFileExplorer.State = {
    activeId: rootFolder.id,
    list: [],
    sort: ['name', 'ASC']
};

export const store = createStore(defaultStore);
