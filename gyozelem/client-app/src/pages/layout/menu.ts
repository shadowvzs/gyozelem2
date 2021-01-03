import { broadcast } from "../../global/Broadcast";
import { LoggedUserData, UserRank } from "../../model/User";
import { layoutController } from "./controller";

export interface MenuItem {
    id: string;
    url?: string;
    action?: (event: MouseEvent) => void;
    component?: string;
    label: string;
    tooltip: string;
    usedAt?: number;
    visible: (user: LoggedUserData) => boolean;
}

export enum MenuPlace {
    None     = 0,
    Burger   = 1 << 0, // 1
    QuickBar = 1 << 1, // 2
    NavBar   = 1 << 2, // 4
}

const openFileExplorer = () => broadcast.emit('panel:init', { componentTag: 'file-explorer', containerConfig: { title: 'File Explorer'} });
const openCalendar = (ev: MouseEvent) => broadcast.emit('panel:init', { 
    componentTag: 'event-calendar', 
    containerConfig: { 
        title: 'test',
        customHeader: '.ec-head',
        mouseEvent: ev
    } 
});

const openAudioPlayer = (ev: MouseEvent) => broadcast.emit('panel:init', { 
    componentTag: 'audio-player', 
    containerConfig: { 
        title: 'Audio Player',
        customHeader: '.header',
        hideHeader: true,
        mouseEvent: ev
    },
    componentProps: {
        config: { 
            autoplay: true,
        }
    }
});

export const menuItems: MenuItem[] = [
    {
        id: "home",
        url: "/home",
        component: "home-page",
        label: "Főoldal",
        tooltip: "Vissza a főoldalra",
        usedAt: 5,
        visible: () => true
    },
    {
        id: "events",
        action: openCalendar,
        // url: "/event",
        // component: "event-page",
        label: "Naptár",
        usedAt: 5,
        tooltip: "Események megtekintése",
        visible: () => true
    },
    {
        id: "videos",
        url: "/video",
        component: "video-page",
        label: "YouTube",
        usedAt: 5,
        tooltip: "YouTube videók megtekintése",
        visible: () => true
    },
    {
        id: "albums",
        action: openFileExplorer,
        // url: "/gallery",
        // component: "gallery-page",
        label: "Media",
        usedAt: 5,
        tooltip: "Kép galéria megtekintése",
        visible: () => true
    },
    {
        id: "worship",
        action: openAudioPlayer,
        label: "Énekek",
        usedAt: 5,
        tooltip: "Dicséretek halgatása",
        visible: () => true
    },
    {
        id: "bible",
        url: "http://biblia.gyozelem.ro",
        label: "Biblia",
        usedAt: 5,
        tooltip: "Ugrás az Online Biblia oldalra",
        visible: () => true
    },
    {
        id: "articles",
        url: "/article",
        component: "article-page",
        label: "Cikkek",
        usedAt: 5,
        tooltip: "Cikkek megtekintése",
        visible: () => true
    },
    {
        id: "users",
        url: "/user",
        component: "user-page",
        usedAt: 3,
        label: "Felhasználók",
        tooltip: "Felhasználók megtekintése",
        visible: (user: LoggedUserData) => user && user.rank >= UserRank.Editor
    },
    {
        id: "messages",
        action: () => alert('uzenetek'),
        label: "Üzenetek",
        usedAt: 3,
        tooltip: "Üzenetek megtekintése",
        visible: (user: LoggedUserData) => !!user
    },
    // {
    //     id: "settings",
    //     action: () => alert('beallitasok'),
    //     label: "Beállítások",
    //     usedAt: 3,
    //     tooltip: "Beállítások megtekintése",
    //     visible: (user: LoggedUserData) => !!user
    // },
    {
        id: "logout",
        action: () => layoutController.logout(),
        component: "logout-page",
        label: "Kijelentkezés",
        usedAt: 3,
        tooltip: "Kijelentkezés",
        visible: (user: LoggedUserData) => !!user
    },
    {
        id: "login",
        url: "/login",
        usedAt: 3,
        component: "login-page",
        label: "Bejelentkezés",
        tooltip: "Bejelentkezés",
        visible: (user: LoggedUserData) => !user
    }
];