import { Type } from "../util/classTransform";
import { CV } from "../util/validator";
import { BaseEntity, IBaseEntity } from "./BaseEntity";

export class Message extends BaseEntity<Message> implements IMessage {
    public static _name = 'Message';

    @CV('REQUIRED', 'Nem lehet ures szoveg')
    public content: string;
    public messageThreadId: string;
    public $thread: MessageThread;
}

export interface IMessageThreadUser extends IBaseEntity<IMessageThreadUser> {
    userId: string;
    messageThreadId: string;
    $thread: MessageThread;
}

export class MessageThreadUser extends BaseEntity<MessageThreadUser> implements IMessageThreadUser {
    public static _name = 'MessageThreadUser';
    public userId: string;
    public messageThreadId: string;
    public $thread: MessageThread;
}

export interface IMessageThread extends IBaseEntity<IMessageThread> {
    messages: Message[];
    users: MessageThreadUser[];
}

export class MessageThread extends BaseEntity<MessageThread> implements IMessageThread {
    public static _name = 'MessageThread';

    @Type(() => Message)
    public messages: Message[] = [];

    @Type(() => MessageThreadUser)
    public users: MessageThreadUser[] = [];
}

export interface IMessage extends IBaseEntity<IMessage> {
    content: string;
    messageThreadId: string;
    $thread: MessageThread;
}
