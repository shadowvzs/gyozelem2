import Guest, { IGuest } from "../model/Guest";
import { CrudService } from "./crudService";

export let guestService: GuestService;

export class GuestService extends CrudService<IGuest> {
    public sortEnabled = false;
    constructor() {
        super(Guest, '/api/guests');
        guestService = this;
    }
}
