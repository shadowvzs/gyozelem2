import { RouterHistory } from "@stencil/router";
import { createStore } from "@stencil/store";
import { LoggedUserData } from "../model/User";
import { guestService } from "../services/guest-service";
import { navigateTo } from "../util/core";

interface IGlobalStore {
    user: LoggedUserData | null;
    history: RouterHistory | null;
}

export const globalStore = createStore<IGlobalStore>({
    user: null,
    history: null
});

globalStore.onChange('user', newUser => {
    console.log('user was changed', newUser);
    if (newUser) {
        sessionStorage.setItem('user', JSON.stringify(newUser));
    } else {
        sessionStorage.removeItem('user');
    }
    guestService.getList();
    navigateTo('/');
});