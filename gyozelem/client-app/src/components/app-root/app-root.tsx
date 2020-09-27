import { Component, h, State, Host } from '@stencil/core';
import { IAudioPlayer } from '../audio-player/types';
import { IPanelManager } from '../panel-manager/types';
import { CV } from '../form-validator/validator';

// import FileExplorer from '../file-explorer';

// const fs = new FileExplorer();

const audioList: IAudioPlayer.Source[] = [
    {
        url: 'https://gyozelem.ro/mp3/aldom-szent-neved-gyozelem-gyulekezet.mp3',
        title: 'Áldom szent neved - Győzelem Gyülekezet',
        type: 'URL'
    },
    {
        url: 'https://gyozelem.ro/mp3/aldott-az-ur-neve-gyozelem-gyulekezet.mp3',
        title: 'Áldott az Úr neve - Győzelem Gyülekezet',
        type: 'URL'
    },
    {
        url: 'https://gyozelem.ro/mp3/eljottel-gyozelem-gyulekezet.mp3',
        title: 'Eljöttél - Győzelem Gyülekezet',
        type: 'URL'
    },      
];

const sliderItems = [
    {
        url: 'https://images.unsplash.com/photo-1582560486381-e6a01d8f5bb7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1352&q=80',
        description: 'asdasda'
    },
    {
        url: 'https://images.unsplash.com/photo-1576086476234-1103be98f096?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=968&q=80',
        description: 'asdasda'
    },
    {
        url: 'https://images.unsplash.com/photo-1579684256060-d5a308109e21?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        description: 'asdasda'
    },        
];

class MyClass {
    @CV('TYPE.EMAIL', 'helytelen email')
    pista: string;// = 'asdasd@asdd.dd';
}

window['aaa'] = new MyClass();

@Component({
    tag: 'app-root',
    styleUrl: 'app-root.css',
    shadow: false
})

export class AppRoot {

    @State()
    activeComponent: string = 'form-validator';

    private triggerEvent = (data: Partial<IPanelManager.Config>) => {
        const event = new CustomEvent('windowRegistry', { detail: data });
        document.dispatchEvent(event);
    }    

    render() {
        return (
            <Host>
                <section style={{ padding: '16px', backgroundColor: '#eee', border: '1px solid #777', borderRadius: '12px', width: '300px' }}>
                    <h3> Component list </h3>
                    <ul>
                        <li onClick={() => { this.activeComponent = 'form-validator'; }}> Form Validator</li>
                        <li onClick={() => { this.activeComponent = 'audio-player'; }}> Audio Player</li>
                        <li onClick={() => { this.activeComponent = 'event-calendar'; }}> Event Calendar </li>
                        <li onClick={() => this.triggerEvent({ componentTag: 'file-explorer', containerConfig: { title: 'test'} })}> File Explorer </li>
                        <li onClick={() => { this.activeComponent = 'notify'; }}> Notify </li>
                        <li onClick={() => { this.activeComponent = 'slider'; }}> Slider </li>
                        <li onClick={() => { this.activeComponent = 'uploader'; }}> Uploader </li>
                    </ul>
                </section> 

                <section>
                    <div>
                        { this.activeComponent === 'form-validator' && (
                            <form-validator model={window['aaa']} submit={console.table} validate-at='SUBMIT'>
                                <div>
                                    <input name='pista' />
                                    <div class="error-message"></div>
                                </div>
                                <input type="submit" />
                            </form-validator>
                        )}
                        
                        { this.activeComponent === 'audio-player' && <audio-player draggable list={audioList}></audio-player>}
                        
                        { this.activeComponent === 'event-calendar' && <event-calendar draggable onSave={(e: any) => { console.log('on save: ', e); return Promise.resolve({}); }}></event-calendar>}
                        
                        { this.activeComponent === 'notify' && (
                            <div>
                                <a href='#' onClick={() => {
                                    const elem = document.body.querySelector('notify-container');
                                    if (elem) { elem.send('success', 'asdasdasd'); }
                                }}> send test message</a>

                                <notify-container></notify-container>
                            </div>
                        )}
                        
                        { this.activeComponent === 'slider' && <div style={{ height: '500px' }}><slider-container items={sliderItems}></slider-container></div> }
                        
                        { this.activeComponent === 'uploader' && <uploader-container></uploader-container> }

                        { /* this.activeComponent === 'file-explorer' && <div style={{maxWidth: '700px', border: '1px solid #000'}}><file-explorer></file-explorer></div> */ }
                    </div>
                </section>
                <uploader-container></uploader-container>
                <panel-manager></panel-manager>
                <context-menu></context-menu>
            </Host>
        );
    }
}
