import { BaseEntity, IBaseEntity } from "./BaseEntity";
import { CV } from "../util/validator";
import { Type } from "../util/classTransform";
import { DateEx } from "./DateEx";

export enum FSTypeEnum {
    UNKNOWN  = 0,
    FOLDER   = 1,
    IMAGE    = 2,
    VIDEO    = 3,
    AUDIO    = 4,
    DOCUMENT = 5,
    ARCHIVE  = 6,
    FONT     = 7
}

export enum FSStatusEnum {
    NONE        = 0, 
    ERROR       = 1,
    UPLOADING   = 2,
    PROCESSING  = 3,
    OK          = 4
}

export const rootFolder = {
    id: '00000000-0000-0000-0000-000000000000',
    status: FSStatusEnum.OK,
    name: 'root',
    parentId: null,
    size: 0,
    type: FSTypeEnum.FOLDER,
    url: '',
    createdAt: new DateEx(0),
    createdBy: '00000000-0000-0000-0000-000000000000'
} as IFSObject;

export interface IFSObject extends IBaseEntity<IFSObject> {
    status: number;
    name: string;
    parentId: string;
    type: FSTypeEnum;
    size: number;
    flag?: number;
    url?: string;
    extension?: string;
    metaData?: IFSOMetaData;
}

export interface IFSOMetaData {
    color?: string;
    duration?: number;
    extension?: string;
    height?: number;
    mime?: string;
    filename?: string;
    originalUrl?: string;
    size?: number;
    url?: string;
    width?: number;
}

class MetaData {
    public pista: number = 1;
    public berci: number = 2;
}

export class FSObject extends BaseEntity<FSObject> implements IFSObject {

    public static _name = 'FSObject';

    public status: number;

    @CV('REQUIRED', 'Kell egy nev')
    public name: string;
    public parentId: string;
    public type: FSTypeEnum;
    public url?: string;
    public size: number;
    public flag?: number;
    public extension?: string;
    @Type(() => MetaData)
    public metaData?: IFSOMetaData;
}

export interface InputProps {
    style?: Record<string, string>;
    placeholder?: string;
    onChange?: (ev: KeyboardEvent) => void;
}

export interface FolderSelectorProps {
    initFolderId?: string;
    onSuccess?: (data: { target: FSObject, title?: string }) => void;
    onClose?: () => void;
    inputProps?: InputProps;
    buttonName?: string;
}

export default FSObject;
