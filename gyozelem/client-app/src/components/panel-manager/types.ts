import { DateEx } from "../../model/DateEx";
import { IHierarchyMap, ITreeObject } from "../../util/core";

export declare namespace IPanelManager {

    type BaseEventTypes = 'MINIMIZE' | 'CLOSE';

    interface BasicPanelAction {
        id: string;
        type: BaseEventTypes; 
    }

    interface ContainerConfig {
        title?: string
        fixedPosition?: boolean;
        position?: Record<'left' | 'right' | 'top' | 'bottom', string>;
        mouseEvent?: MouseEvent;
        width?: string;
        height?: string;
        theme?: 'blue-theme';
        initState?: 'show' | 'hide';
        customHeader?: string;

        hideMinimize?: boolean;
        hideClose?: boolean;
    }

    interface Config {
        componentTag?: string;
        componentProps?: Record<string, any>;
        elem?: HTMLElement;
        component?: HTMLElement;
        windowId: string;
        containerConfig?: ContainerConfig
        panelHook?: (config: Config) => void;
        onClose?: () => void;

        linkWithCaller?: boolean;
        callerWindowId?: string;

        createdAt?: DateEx;
    }
    
    interface State {
        panels: IHierarchyMap<ITreeObject<IPanelManager.Config>>;
        activePanelId: string;
    }

}
