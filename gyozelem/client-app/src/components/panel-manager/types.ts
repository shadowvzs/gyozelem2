import { IArrayValueMap, ITreeObject } from "../../core/util/core";

export declare namespace IPanelManager {

    type BaseEventTypes = 'MINIMIZE' | 'CLOSE';

    interface SimpleDetail {
        id: string;
        type: BaseEventTypes; 
    }

    interface SimpleEvent extends Event {
        detail: SimpleDetail;
    }

    interface ContainerConfig {
        title?: string
        fixedPosition?: boolean;
        position?: Record<'left' | 'right' | 'top' | 'bottom', string>;
        width?: string;
        height?: string;
        theme?: 'blue-theme';
        initState?: 'show' | 'hide';

        hideMinimize?: boolean;
        hideClose?: boolean;
    }

    interface Config {
        componentTag?: string;
        componentProps?: Record<string, any>;
        elem?: HTMLElement;
        component?: HTMLElement;
        windowId: string;
        newWindowId?: string
        containerConfig?: ContainerConfig
        panelHook?: (config: Config) => void;
        onClose?: () => void;

        linkWithCaller?: boolean;
        callerWindowId?: string;

        createdAt?: Date;
    }
    
    interface State {
        panels: IArrayValueMap<ITreeObject<IPanelManager.Config>>;
        activePanelId: string;
    }

}
