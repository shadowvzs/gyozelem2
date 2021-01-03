import { CV } from "../util/validator";
import { BaseEntity, IBaseEntity } from "./BaseEntity";

export interface IGuest extends IBaseEntity<IGuest> {
    fullName: string;
}

export class Guest extends BaseEntity<Guest> implements IGuest {
    public static _name = 'Guest';

    @CV('REQUIRED', 'Kell egy nev')
    public fullName: string;
}

export default Guest;