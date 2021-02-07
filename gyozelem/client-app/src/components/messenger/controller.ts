import { createStore } from "@stencil/store";
import { broadcast, ISignalREntity } from "../../global/Broadcast";
import { globalStore } from "../../global/stores";
import { translation } from "../../global/translation";
import { Message, MessageThread, MessageThreadUser } from "../../model/Message";
import { MessageService } from "../../services/message-service";
import { plainToClass } from "../../util/classTransform";
import { IMessenger } from "./types";

interface State {
    activeThreadId: string;
    activeThread: MessageThread;
    activeMessage: Message;
    activeTab: IMessenger.Tab;
    show: boolean;
}

export class MessengerController {

    private service = new MessageService();
    private broadcast = broadcast;

    public globalStore = globalStore;

    public store = createStore<State>({
        activeThreadId: '',
        activeThread: new MessageThread(),
        activeMessage: new Message(),
        show: true,
        activeTab: 'message'
    });

    private _threadSubScription = broadcast.on('signalr:' + MessageThread._name, (rawJson) => {
        const plainThreadData: ISignalREntity<MessageThread> = JSON.parse(rawJson);
        if (!plainThreadData?.entity) { return 'no entity'; }
        console.log('thread', rawJson)
        const thread = plainToClass(plainThreadData.entity, MessageThread);
        console.log('thread', thread)
    });

    private _messageSubScription = broadcast.on('signalr:' + Message._name, (rawJson) => {
        const plainThreadMessageData: ISignalREntity<Message> = JSON.parse(rawJson);
        if (!plainThreadMessageData?.entity) { return 'no entity'; }
        const store = this.store;
        if (plainThreadMessageData.entity.messageThreadId !== store.get('activeThreadId')) {
            return 'we dont need update, not current message';
        }

        if (plainThreadMessageData.state === 'Added') {
            const currentThread = store.get('activeThread');
            const message = plainToClass(plainThreadMessageData.entity, Message);
            currentThread.messages.push(message);
            store.set('activeThread', currentThread.clone());
            console.log('message', message);
        }
    });

    private _userSubScription = broadcast.on('signalr:' + MessageThreadUser._name, (rawJson) => {
        const plainThreadUserData: ISignalREntity<MessageThreadUser> = JSON.parse(rawJson);
        if (!plainThreadUserData?.entity) { return 'no entity'; }
        console.log(' user', rawJson)
        const thread = plainToClass(plainThreadUserData.entity, MessageThreadUser);
        console.log('thread user', thread)
    });

    constructor(public panelElem: HTMLDivElement) {
        // this.service.
        this.service.getThreads();
    }

    public get isVisible() {
        return this.store.state.show;
    }

    public toggleWindow = () => {
        this.store.set('show', !this.isVisible);
    }
    
    public getHistory = async (userIds: string[]): Promise<void> => {
        const store = this.store;
        const threadId = store.get('activeThreadId');
        try {
            let thread: MessageThread;
            if (threadId) {
                thread = this.service.getThreadById(threadId);
            } else {
                thread = await this.service.getThreadHistory(userIds);
            }

            store.set('activeThread', thread || new MessageThread());
            const tId = store.get('activeThread').id;
            store.set('activeThreadId', tId);
            const message = store.get('activeMessage');
            message.messageThreadId = tId;
        } catch (err) {
            console.error(err);
        }
    }

    public sendMessage = async (msg: Message) => {
        const { activeThread } = this.store.state;
        if (activeThread.users.length === 0) {
            return alert('no user');
        }
        await this.service.sendMessage(msg, activeThread.users.map(x => x.userId));
        const message = new Message();
        message.messageThreadId = activeThread?.id;
        this.store.set('activeMessage', message);
    }

    public getMessagesFromActiveThread = () => {
        const thread = this.store.get('activeThread'); 
        return thread.messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    public dispose() {
        this._threadSubScription.unsubscribe();
        this._messageSubScription.unsubscribe();
        this._userSubScription.unsubscribe();
        if (this.service) {
            this.service.dispose();
        }
    }    
}
