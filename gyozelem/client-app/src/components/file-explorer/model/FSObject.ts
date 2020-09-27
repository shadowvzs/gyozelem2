import { BaseEntity, IBaseEntity } from "../../../core/model/BaseEntity";
import { CV } from "../../form-validator/validator";
// import { IBaseModel } from "../../form-validator/BaseModel";

export enum FSTypeEnum {
    UNKNOWN  = 0,
    FOLDER   = 1,
    IMAGE    = 2,
    VIDEO    = 3,
    AUDIO    = 4,
    DOCUMENT = 5,    
}

export enum FSStatusEnum {
    NONE = 0, 
    ERROR = 1,
    UPLOADING,
    PROCESSING,
    OK   
}

export const rootFolder = {
    id: '00000000-0000-0000-0000-000000000000',
    status: 1,
    name: 'root',
    parentId: null,
    size: 0,
    type: FSTypeEnum.FOLDER,
    url: '',
    createdAt: new Date(0),
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

export class FSObject extends BaseEntity<FSObject> implements IFSObject {

    public status: number;

    @CV('REQUIRED', 'Kell egy nev')
    public name: string;
    public parentId: string;
    public type: FSTypeEnum;
    public url?: string;
    public size: number;
    public flag?: number;
    public extension?: string;
    public metaData?: IFSOMetaData;
}

export default FSObject;
