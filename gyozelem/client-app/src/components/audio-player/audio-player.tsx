import { Component, State, h, Prop } from '@stencil/core';
import { AudioPlayerController } from './controller';
import { IAudioPlayer } from './types';

@Component({
    tag: 'audio-player',
    styleUrl: 'audio-player.css',
    shadow: false
})

export class AudioPlayer {
    private title = 'Audio Player';               // audio player title
    protected controller: AudioPlayerController
    protected file: HTMLInputElement;

    @Prop()
    config: IAudioPlayer.Config;
    
    @State() state: object = {};


    connectedCallback(): void {
        this.controller = new AudioPlayerController(this.config);
        this.controller.forceUpdate = () => this.state = {};
    }

    disconnectedCallback() {
        this.controller.dispose();
        console.info('removed the audioplayer from dom')
    }

    render() {

        const {
            apStore,
            getDuration,
            onChangeAudio,
            onChangeVolume,
            onListReset,
            onPlay,
            onPause,
            onStop,
        } = this.controller;

        const {
            loop,
            anchor,
            random,
            menu,
            list,
            status,
            currentAudioData,
            volume,
        } = apStore.state;

        return (
            <div class='audio-player'>
                <div class='header'>
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
                        <span class={`loop_icon ${loop ? 'active' : ''}`} onClick={() => apStore.set('loop', !loop)} title="If audio reach to the end then jump to next audio file">&infin;</span>
                        <span class={`anchor_icon ${anchor ? 'active' : ''}`} onClick={() => apStore.set('anchor', !anchor)} title="If loop is on then same audio will be played after it is ended">&#9875;</span>
                        <span class={`random_icon ${random ? 'active' : ''}`} onClick={() => apStore.set('random', !random)} title="Next audio will be random">&#x2608;</span>
                        <span class="spacer"></span>
                        <span class="speaker_icon" title="Change audio volume">🔊</span>
                        <span class="volume_bar">
                            <div class="volume_dir">-</div>
                            <input 
                                class="volume" 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={volume} 
                                onChange={onChangeVolume}
                              />
                            <div class="volume_dir">+</div>
                        </span>
                    </div>
                    <div>
                        <div class="button" onClick={() => apStore.set('menu', !menu)}>&equiv;</div>
                        <input type="file" ref={(el: HTMLInputElement) => this.file = el} /> 
                        { menu && (
                            <div class='menu'>
                                {/*
                                    <div p-action="onLoadLocalAudio" p-accept=".mp3,audio/*">Load from PC</div>
                                    <div p-action="onLoadLocalAudio" p-accept=".jpl">Load Playlist</div>
                                    <div onClick={this.onSavePlaylist}>Save Playist</div>
                                */}
                                <div onClick={onListReset}>Clear Playlist</div>
                            </div>
                        )}
                    </div>
                    <center>
                        <div onClick={onPlay} class="button"><div class="play"></div></div>
                        <div onClick={onPause} class="button"><div class="pause"></div></div>
                        <div onClick={onStop} class="button"><div class="stop" ></div></div>
                    </center>
                </div>
                <div class='container' data-count={list.length}>
                    <div class='plist content'>
                        <ul onClick={onChangeAudio}>
                            {list.map(({ id, title, duration }) => (
                                <li class={currentAudioData && currentAudioData.id === id ? 'selected' : ''} p-id={id} title={title}>
                                    {title} - {getDuration(duration)}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <input type="range" class="scrollBar" min="0" max="100" value="0" />
                </div>
            </div>     
        );
    }
}
