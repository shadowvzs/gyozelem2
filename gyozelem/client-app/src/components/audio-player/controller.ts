import { createStore } from "@stencil/store";
import FSObject, { FSTypeEnum } from "../../model/FSObject";
import { FileService } from "../../services/file-service";
import { IAudioPlayer } from "./types";

//#region helpers
const audioSrcToData = async (e: FSObject): Promise<IAudioPlayer.Data> => {
    const audioEl = new Audio(e.url);

    // load meta data
    const metaStatus = await (new Promise(resolve => {
        audioEl.onloadedmetadata = () => resolve('SUCCESS');
        audioEl.onerror = () => resolve('ERROR');
    })) as 'SUCCESS' | 'ERROR';

    const data: IAudioPlayer.Data = {
        type: 'URL',
        url: e.url,
        title: e.name,
        audioEl: audioEl,
        id: "" + (Date.now() + Math.random()),
        metaStatus: metaStatus,
        duration: ~~audioEl.duration,
    };
    return data;
}
//#endregion

export class AudioPlayerController {

    protected file: HTMLInputElement;
    protected service = new FileService();
    public forceUpdate = () => {};
    private timerId: number = 0;             // interval timer Id

    public apStore = createStore<IAudioPlayer.State>({
        loop: true,                  // play another audio if current is ended
        anchor: false,               // play current audio file after it is ended
        random: false,               // next audio is random from the playlist
        volume: 100,                 // volume strength in percentage
        currentAudioData: null,      // current AudioData, if no current audio then it will be null
        status: 'STOP',              // player status: PAUSE | STOP | PLAY
        menu: false,                 // show or hide menu
        list: [],                    // fetched (we already have meta data) play list
    });

    constructor(public config: IAudioPlayer.Config = {}) {
        this.loadList(config.list).then(() => {
            if (config.autoplay) {
                this.onPlay();
            }
        });
        
    }

    public onChangeVolume = (e: InputEvent): void => {
        const volume = +(e.target as HTMLInputElement).value;
        const data = this.apStore.state.currentAudioData;
        this.apStore.set('volume', volume);
        if (data) { data.audioEl.volume = volume / 100; }
    }

    public async loadList(list: FSObject[]): Promise<void> {
        const items = list || (await this.service.getList({ type: FSTypeEnum.AUDIO }, { noList: true })).items;
        const fetchedNewItems = await Promise.all(items.map(e => audioSrcToData(e)));
        const currentList = this.apStore.get('list');
        const newList = [...currentList, ...fetchedNewItems.filter(x => x.metaStatus === 'SUCCESS')];
        this.apStore.set('list', newList);
    }

    public onChangeAudio = (e: Event): void => {
        const id = (e.target as HTMLElement).getAttribute('p-id');
        if (!id) { return; }
        this.onSelect(this.apStore.state.list.find(e => e.id === id));
    }

    public onSelect = (data: IAudioPlayer.Data): void => {
        const { currentAudioData, status } = this.apStore.state;
        if (currentAudioData && status !== 'STOP') {
            this.onStop();
        }
        this.apStore.set('currentAudioData', data);
        this.onPlay();
    }

    public onPlay = (): void => {
        const { currentAudioData, status, volume, list } = this.apStore.state;
        if (status === 'PLAY') { return; }
        if (!currentAudioData) { 
            if (!list.length) {
                return console.warn('You must have atleast 1 track to play'); 
            }
            this.apStore.set('currentAudioData', list[0]);
            return this.onPlay();
        }
        const { audioEl } = currentAudioData;
        audioEl.onended = this.onEnded.bind(this);
        this.apStore.set('status', 'PLAY');
        this.timerId = window.setInterval(() => this.forceUpdate(), 1000);
        audioEl.volume = volume / 100;
        audioEl.play();
        
    }

    public onPause = (): void => {
        const { currentAudioData } = this.apStore.state;
        if (!currentAudioData) { return; }
        currentAudioData.audioEl.pause();
        clearInterval(this.timerId);

        this.apStore.set('status', 'PAUSE');
    }

    public onStop = (): void => {
        const data = this.apStore.state.currentAudioData;
        if (!data) { return; }
        const { audioEl } = data;

        audioEl.onended = null;
        audioEl.pause();
        audioEl.currentTime = 0;

        this.apStore.set('status', 'STOP');
        this.apStore.set('currentAudioData', null);
    }

    public onEnded = (): void => {
        const { list, loop, anchor, random, currentAudioData } = this.apStore.state;
        if (!list || !list.length || !loop) { return; }
        const lastIndex = list.length - 1;
        let newData: IAudioPlayer.Data;
        if (anchor) {
            newData = currentAudioData;
        } else if(random) {
            newData = list[Math.round(Math.random() * lastIndex)];
        } else {
            newData = list[lastIndex] === currentAudioData ? list[0] : list[list.findIndex(x => x.id === currentAudioData.id) + 1];
        }
        this.onSelect(newData);
    }

    public onListReset = (): void => {
        this.onStop();
        this.apStore.set('list', []);
        this.apStore.set('menu', false);
    }

    public getDuration = (sec: number = 0): string => {
        return ('00' + ~~(sec / 60)).slice(-2) + ':' + ('00' + sec % 60).slice(-2);
    }

    public dispose = () => {
        this.service.dispose();
        this.onStop();
    }
}

/*
    private openFile = (accept: string = ''): Promise<File[]> => {
        return new Promise((resolve, reject) => {
            const id = setTimeout(() => reject(), 30000);
            this.file.accept = accept;
            this.file.onabort = () => { 
                clearTimeout(id);
                reject();
            };
            this.file.oncancel = () => { 
                clearTimeout(id);
                reject();
            };
            this.file.onchange = () => {
                clearTimeout(id);
                resolve(Array.from(this.file.files));
            }
            this.file.click();
        });
    }

    private onSavePlaylist = (): void => {
        const list = this.state.list
            .filter(e => e.type === 'URL')
            .map(e => ({ title: e.title, url: e.url }));
        if (!list.length) { return; }
        // this.fs.saveFile("playlist.jpl", list, "application/json");
        this.setState('menu');
    }

    private onLoadLocalAudio = async (event: MouseEvent): Promise<void> => {
        const accept = (event.target as HTMLElement).getAttribute('p-accept') || '';
        let files: File[];
        try {
            files = await this.openFile(accept);
            if (!files || !files.length) { console.error('No file selected'); }
        } catch (err) {
            return console.error('Failed to load files');
        }
        const audioFiles = files.filter(e => e.name.substr(-4) === '.mp3');
        const listFiles = files.filter(e => e.name.substr(-4) === '.jpl');

        if (listFiles.length) this.loadPlaylists((await this.fs.readFiles(listFiles, 'json') as AudioSource[][]));
        const result: any[] = await this.fs.readFiles(listFiles, 'json');
        this.setState('menu');
        this.openLocalAudio(audioFiles);
        return;
    }
*/