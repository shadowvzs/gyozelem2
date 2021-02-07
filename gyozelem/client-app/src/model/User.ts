import { CV } from "../util/validator";
import { BaseEntity, IBaseEntity } from "./BaseEntity";

export enum UserRank {
    None = 0,
    Member = 1,
    Editor = 2,
    Admin = 3
}

export interface IUser extends IBaseEntity<IUser> {
    username: string;
    fullname?: string;
    rank?: UserRank;
}

export class User extends BaseEntity<User> implements IUser {

    public static _name = 'User';
    public username: string;
    public displayName: string;
    public rank?: UserRank;
    // public image?: string;
    // public token?: string;
}

export interface ILoginUserData extends IBaseEntity<ILoginUserData> {
    username: string;
    password: string;
}

export class LoginUserData extends BaseEntity<LoginUserData> implements ILoginUserData {

    public static _name = 'LoginUserData';

    @CV('REQUIRED', 'Kell egy szoveg')
    public username: string = '';

    @CV('LENGTH.MIN_MAX', 'Jelszo 8-64 betu kozott szokott lenni', [8, 32])
    @CV('TYPE.LOWER_UPPER_NUM_SYMBOL', 'A jelszó szám, kis/nagy betű es speciális karatkter kell legyen!')
    public password: string = '';
}

export interface ISignUpUserData extends IBaseEntity<ISignUpUserData> {
    username: string;
    password: string;
}

export class SignUpUserData extends BaseEntity<SignUpUserData> implements ISignUpUserData {

    public static _name = 'SignUpUserData';

    @CV('LENGTH.MIN_MAX', 'A nev 3-64 betu kozott legyen', [3, 64])
    public displayName: string = '';

    @CV('LENGTH.MIN_MAX', 'A felhasznalonev 3-64 betu kozott legyen', [6, 64])
    public username: string = '';

    @CV('TYPE.EMAIL', 'Valos email cim kell')
    public email: string = '';

    @CV('LENGTH.MIN_MAX', 'Jelszo 8-64 betu kozott legyen', [8, 32])
    @CV('TYPE.LOWER_UPPER_NUM_SYMBOL', 'A jelszó szám, kis/nagy betű es speciális karatkterből álljon')
    public password: string = '';
}

export class LoggedUserData {
    public id?: string;
    public username: string;
    public displayName: string;
    public token: string;
    public rank: UserRank;
}