import { HubConnection } from "@microsoft/signalr";
import { getSignalRConnection } from "./SignalR";

type Data = any;
type Callback = (data: Data) => void;

class Channel<T> {
    private _listeners: Set<Callback> = new Set();

    constructor(public name: string) {
        // maybe in future we will do here something, atm we do not need this
    }

    postMessage = (data: T): void => {
        this._listeners.forEach(cb => cb(data));
    }

    subscribe = (cb: Callback): void => {
        this._listeners.add(cb);
    }

    unsubscribe = (cb: Callback): void => {
        this._listeners.delete(cb);
    }

    close = (): void => {
        this._listeners.clear();
    }

    get listenerCount(): number {
        return this._listeners.size;
    }
}

export let broadcast: Broadcast;

export class Broadcast {

    // singletone init
    public static getInstance = async () => {
        if (broadcast) { return broadcast; }
        const bInstance = new Broadcast();
        broadcast = bInstance;
        return await bInstance.init();
    }

    private signalRConnection: HubConnection;
    private _channelMap: Map<string, Channel<unknown>> = new Map();
    private _getChannel = <T = any>(type: string): Channel<T> => {
        if (!this._channelMap.has(type)) {
            this._channelMap.set(type, new Channel<T>(type));
        }
        return this._channelMap.get(type) as Channel<T>;
    }

    public init = async () => {
        this.signalRConnection = await getSignalRConnection();
        return this;
    }

    on = (type: string, cb: Callback) => {
        const channel = this._getChannel(type);
        const isSignalR = type.startsWith('signalr:');
        if (isSignalR && channel.listenerCount === 0) {
            this.signalRConnection.on(
                type.replace('signalr:', ''), 
                (message: string) => {
                    channel.postMessage(message);
                }
            );
        }

        channel.subscribe(cb);

        return {
            type,
            channel,
            unsubscribe: () => { 
                channel.unsubscribe(cb);
                if (channel.listenerCount === 0) {
                    this.signalRConnection.off(type.replace('signalr:', ''));
                }
            }
        };
    }

    emit = <T>(type: string, data: T) => {
        const channel = this._getChannel(type);
        channel.postMessage(data);
    }
}

export interface ISignalREntity<T> {
    entity: T;
    state: 'added' | 'modified' | 'deleted';
    target: string;
}
