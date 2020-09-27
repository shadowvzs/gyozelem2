import { IContextMenu } from "./types";

export function contextMenu <T>(menuList: IContextMenu.Menu<T>[]) {
    return (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const event = new CustomEvent('contextMenu', { detail: {
            x: e.x,
            y: e.y,
            target: e.target,
            menu: menuList
        } });
        document.dispatchEvent(event);
    }
};