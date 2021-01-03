import FSObject from "../../model/FSObject";

export declare namespace IAudioPlayer {

    interface Config {
        autoplay?: boolean;
        list?: FSObject[];
    }

    interface Source {
        title: string;
        type: 'URL' | 'BLOB';
        url: string;
    }
    
    interface Data extends Source {
        id: string;
        audioEl: HTMLAudioElement;
        metaStatus?: 'PENDING' | 'SUCCESS' | 'ERROR';
        duration?: number;
    }
    
    interface State {
        volume: number;
        loop: boolean,
        anchor: boolean,
        random: boolean,
        currentAudioData: Data | null;
        status: 'PAUSE' | 'PLAY' | 'STOP';
        menu: boolean;
        list: any[];
    }
}
