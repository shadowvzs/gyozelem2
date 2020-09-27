import { Component, State, Prop, Host, h } from '@stencil/core';
import { IAudioPlayer } from './types';
import externalDependencies from "./dependencies";

const { Draggable } = externalDependencies;

//#region helpers
const getDuration = (sec: number = 0): string => {
    return ('00' + ~~(sec / 60)).slice(-2) + ':' + ('00' + sec % 60).slice(-2);
}

const audioSrcToData = async (e: IAudioPlayer.Source): Promise<IAudioPlayer.Data> => {
    const audioEl = new Audio(e.url);

    // load meta data
    const metaStatus = await (new Promise(resolve => {
        audioEl.onloadedmetadata = () => resolve('SUCCESS');
        audioEl.onerror = () => resolve('ERROR');
    })) as 'SUCCESS' | 'ERROR';

    const data: IAudioPlayer.Data = {
        type: 'URL',
        url: e.url,
        title: e.title,
        audioEl: audioEl,
        id: "" + (Date.now() + Math.random()),
        metaStatus: metaStatus,
        duration: ~~audioEl.duration,
    };
    return data;
}

//#endregion
@Component({
    tag: 'audio-player',
    styleUrl: 'audio-player.css',
    shadow: true
})


export class AudioPlayer {
    private $elem: HTMLDivElement;
    private title = 'Audio Player';               // audio player title
    protected file: HTMLInputElement;
    protected listContainer: HTMLDivElement;

    @Prop() list: {
        title: string;
        type: 'URL' | 'BLOB';
        url: string;
    }[] = [] as IAudioPlayer.Source[];
    
    @Prop() canDrag: boolean;
  
    @State() state: IAudioPlayer.State = {
        loop: true,                  // play another audio if current is ended
        anchor: false,               // play current audio file after it is ended
        random: false,               // next audio is random from the playlist
        volume: 100,                 // volume strength in percentage
        currentAudioData: null,      // current AudioData, if no current audio then it will be null
        status: 'STOP',              // player status: PAUSE | STOP | PLAY
        menu: false,                 // show or hide menu
        list: [],                    // fetched (we already have meta data) play list
        timerId: 0,                  // interval timer Id
    }

    connectedCallback(): void {
        if (this.list) { this.loadList(this.list); }
    }

    componentDidLoad() {
        // Optional: we can make the window draggable :)
        if (this.canDrag && this.$elem && Draggable) {
            new Draggable(this.$elem, this.$elem.querySelector('.ec-head'));
        }
    }

    private setState = (state: Partial<IAudioPlayer.State>) => {
        this.state = {...this.state, ...state };
    }

    private forceUpdate() {
        this.setState({...this.state});
    }

    private onChangeVolume = (e: InputEvent): void => {
        const volume = +(e.target as HTMLInputElement).value;
        const data = this.state.currentAudioData;
        this.setState({volume: volume});
        if (data) {
            data.audioEl.volume = volume / 100;
        }
    }

    public async loadList(list: IAudioPlayer.Source[]): Promise<void> {
        const fetchedNewItems = await Promise.all(list.map(e => audioSrcToData(e)));
        const newList = [...this.state.list, ...fetchedNewItems.filter(x => x.metaStatus === 'SUCCESS')];
        this.setState({list: newList});
    }

    private onChangeAudio = (e: Event): void => {
        const id = (e.target as HTMLElement).getAttribute('p-id');
        if (!id) { return; }
        this.onSelect(this.state.list.find(e => e.id === id));
    }

    private onSelect = (data: IAudioPlayer.Data): void => {
        const { currentAudioData, status } = this.state;
        if (currentAudioData && status !== 'STOP') {
            this.onStop();
        }
        this.state.currentAudioData = data;
        this.onPlay();
    }

    private onPlay = (): void => {
        const { currentAudioData, status, volume } = this.state;
        if (status === 'PLAY') { return; }
        if (!currentAudioData) { 
            if (!this.state.list.length) {
                return console.warn('You must have atleast 1 track to play'); 
            }
            this.setState({ currentAudioData: this.state.list[0] });
            return this.onPlay();
        }
        const { audioEl } = currentAudioData;
        audioEl.onended = this.onEnded.bind(this);
        this.setState({ 
            status: 'PLAY',
            timerId: window.setInterval(() => this.forceUpdate(), 1000)
        });
        audioEl.volume = volume / 100;
        audioEl.play();
        
    }

    private onPause = (): void => {
        const { timerId, currentAudioData } = this.state;
        if (!currentAudioData) { return; }
        currentAudioData.audioEl.pause();
        clearInterval(timerId);

        this.setState({ status: 'PAUSE' });
    }

    private onStop = (): void => {
        const data = this.state.currentAudioData;
        if (!data) { return; }
        const { audioEl } = data;

        audioEl.onended = null;
        audioEl.pause();
        audioEl.currentTime = 0;

        this.setState({
            status: 'STOP',
            currentAudioData: null,
        });
    }

    private onEnded = (): void => {
        const { list, loop, anchor, random, currentAudioData } = this.state;
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

    private onListReset = (): void => {
        this.onStop();
        this.setState({
            list: [],
            menu: false
        });
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
        console.log(accept);
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

    render() {

        const {
            loop,
            anchor,
            random,
            menu,
            list,
            status,
            currentAudioData,
        } = this.state;

        return (
            <Host ref={(el: HTMLDivElement) => this.$elem = el}>
                <div class='header' p-drag={true}>
                    {this.title}
                    <div class="minimize"><a p-action="minimize"> </a></div>
                    <div class="close"><a p-action="close">&times;</a></div>
                </div>
                <div class='details'>
                    <div class="title"> { currentAudioData ? currentAudioData.title : 'Select something' }</div>
                    <div class="track-timer">
                        <span class={status === 'PAUSE' && currentAudioData ? ' blink' : ''}>
                            { currentAudioData ? getDuration(~~currentAudioData.audioEl.currentTime) : '00:00' } 
                        </span> 
                        /{ currentAudioData ? getDuration(currentAudioData.duration) : '00:00' }
                    </div>
                    <input 
                        class="track" 
                        type="range" 
                        min="0" 
                        max={currentAudioData ? currentAudioData.duration : 0} 
                        value={currentAudioData ? ~~currentAudioData.audioEl.currentTime : 0}
                        onChange={currentAudioData ? (e: InputEvent) => currentAudioData.audioEl.currentTime = +(e.target as HTMLInputElement).value : undefined} 
                    />
                    <br />
                    <div class="volume_row">
                        <span class={`loop_icon ${loop ? 'active' : ''}`} onClick={() => this.setState({loop: !loop})} title="If audio reach to the end then jump to next audio file">&infin;</span>
                        <span class={`anchor_icon ${anchor ? 'active' : ''}`} onClick={() => this.setState({anchor: !anchor})} title="If loop is on then same audio will be played after it is ended">&#9875;</span>
                        <span class={`random_icon ${random ? 'active' : ''}`} onClick={() => this.setState({random: !random})} title="Next audio will be random">&#x2608;</span>
                        <span class="spacer"></span>
                        <span class="speaker_icon" title="Change audio volume">🔊</span>
                        <span class="volume_bar">
                            <div class="volume_dir">-</div>
                            <input 
                                class="volume" 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={this.state.volume} 
                                onChange={this.onChangeVolume}
                              />
                            <div class="volume_dir">+</div>
                        </span>
                    </div>
                    <div>
                        <div class="button" onClick={() => this.setState({menu: !menu})}>&equiv;</div>
                        <input type="file" ref={(el: HTMLInputElement) => this.file = el} /> 
                        { menu && (
                            <div class='menu'>
                                {/*
                                    <div p-action="onLoadLocalAudio" p-accept=".mp3,audio/*">Load from PC</div>
                                    <div p-action="onLoadLocalAudio" p-accept=".jpl">Load Playlist</div>
                                    <div onClick={this.onSavePlaylist}>Save Playist</div>
                                */}
                                <div onClick={this.onListReset}>Clear Playlist</div>
                            </div>
                        )}
                    </div>
                    <center>
                        <div onClick={this.onPlay} class="button"><div class="play"></div></div>
                        <div onClick={this.onPause} class="button"><div class="pause"></div></div>
                        <div onClick={this.onStop} class="button"><div class="stop" ></div></div>
                    </center>
                </div>
                <div class='container' ref={(el: HTMLDivElement) => this.listContainer = el} data-count={list.length}>
                    <div class='plist content'>
                        <ul onClick={this.onChangeAudio}>
                            {list.map(({ id, title, duration }) => (
                                <li class={currentAudioData && currentAudioData.id === id ? 'selected' : ''} p-id={id} title={title}>
                                    {title} - {getDuration(duration)}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <input type="range" class="scrollBar" min="0" max="100" value="0" />
                </div>
            </Host>     
        );
    }
}
