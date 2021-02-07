import { globalStore } from "../global/stores";
import { IMessageThread, Message, MessageThread } from "../model/Message";
import { plainToClass } from "../util/classTransform";
import { CrudService } from "./crudService";

export let messageService: MessageService;

export class MessageService extends CrudService<IMessageThread> {
    public sortEnabled = false;
    public get user() { 
        return globalStore.get('user');
    }

    constructor() {
        super(MessageThread, '/api/messagethreads');
        messageService = this;
        window['ssss'] = this;
    }
    
    // get thread history
    public getThreadHistory = async (userIds: string[]): Promise<MessageThread> => {
        if (!userIds.includes(this.user.id)) {
            userIds.push(this.user.id);
        }
        
        const thread = await this.request.send<MessageThread>(
            '/api/messagethreads/history?targetIds=' + userIds.join(','), {
                // data: { targetIds: userIds }, 
                method: 'GET' 
            }
        );

        if (!thread.data) { return; }

        return plainToClass(thread.data, MessageThread);
    }

    public getThreads = async () => {
        await this.getList();
        console.log(this.items);        
    }

    // fbb47a2e-be53-456d-9079-20e057583efd
    // f4df5b22-d264-4260-9b91-26a5d6d10dc2
    public sendMessage = async (message: Message, userIds: string[] = []) => {
        if (!message.messageThreadId) {
            const thread = await this.getOrCreateThread(userIds);
            message.messageThreadId = thread.id;
        }
        const msg = await this.createMessage(message.messageThreadId, message.content);
        return msg;
    }

    public getThread = (threadId: string): MessageThread => {
        let thread: MessageThread;
        if (threadId) {
            thread = this.items.find(x => x.id === threadId);
        }
        return thread;
    }

    public getThreadById = (threadId: string): MessageThread => {
        return this.items.find(x => x.id === threadId);
    }

    // get thread history OR create new thread
    public getOrCreateThread = async (userIds: string[]): Promise<MessageThread> => {
        if (!userIds.includes(this.user.id)) {
            userIds.push(this.user.id);
        }
        return this.createPromise({ targetIds: userIds })
    }

    public createMessage = async (messageThreadId: string, content: string) => {
        const message = await this.request.send<Message>(
            '/api/messages', {
                data: { messageThreadId, content }, 
                method: 'POST' 
            }
        );

        return message?.data;
    }
}
