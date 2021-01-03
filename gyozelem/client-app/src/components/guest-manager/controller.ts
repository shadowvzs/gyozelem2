import { createStore } from "@stencil/store";
import Guest from "../../model/Guest";
import { guestService } from "../../services/guest-service";

export class GuestManagerController {
    public forceUpdate = () => {};
    public service = guestService;
    public uiStore = createStore({ 
        editedItemId: '',
        newGuest: new Guest(),
    });

    public get items() {
        return this.service.items;
    }

    constructor() {
        this.service.getList();
    }

    public get selectedIds() {
        return this.service.selectedIds;
    }

    public set selectedIds(ids: string[]) {
        this.service.selectedIds = ids;
    }

    public createGuest = (guest: Guest) => {
        return this.service.createPromise(guest)
            .then(() => {
                guest.fullName = '';
                this.uiStore.set('newGuest', new Guest(guest));
            });
    }

    public updateGuest = (guest: Guest) => {
        return this.service.updatePromise(guest);
    }

    public deleteGuest = (guest: Guest) => {
        return this.service.deletePromise(guest.id);
    }

    public editItem = (guest: Guest) => {
        this.uiStore.set('editedItemId', guest.id);
    }

    public updateItem = (guest: Guest) => {
        return this.service.updatePromise(guest)
            .then(() => {
                if (this.uiStore.get('editedItemId') === guest.id) {
                    this.cancelEditItem();
                }
            });
    }

    public cancelEditItem = () => {
        this.uiStore.set('editedItemId', '');
    }

    public deleteItem = (guest: Guest) => {
        if (this.uiStore.get('editedItemId') === guest.id) {
            this.cancelEditItem();
        }
        return this.service.deletePromise(guest.id);
    }

    public toggle = (guest: Guest) => {
        this.service.toggleSelect(guest.id);
    }

    public dispose = () => {
        // clean up if needed
    }
}
