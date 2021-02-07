import { RouterHistory } from "@stencil/router";
import { createStore } from "@stencil/store";
import { LoggedUserData } from "../model/User";
import { guestService } from "../services/guest-service";
import { IArrayValueMap, navigateTo } from "../util/core";
import { bootstrap } from './app';

interface IGlobalStore {
    user: LoggedUserData | null;
    users: IArrayValueMap<LoggedUserData>;
    history: RouterHistory | null;
    loaded: boolean;
}

export const globalStore = createStore<IGlobalStore>({
    user: null,
    users: null,
    history: null,
    loaded: false,
});

bootstrap().then(() => {
    globalStore.set('loaded', true);
});

globalStore.onChange('user', newUser => {
    if (newUser) {
        sessionStorage.setItem('user', JSON.stringify(newUser));
    } else {
        sessionStorage.removeItem('user');
    }
    guestService.getList();
    navigateTo('/');
});