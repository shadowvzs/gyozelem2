const themes = {
    "Light Theme": {
        "fs-icon-color-default": "#777",
        "fs-icon-color-warning": "yellow",
        "fs-icon-color-error": "red",
        "fs-icon-color-confirm": "green",
        "fs-icon-color-selected": "blue",
        "fs-icon-color-active": "rgba(0,0,0,0.87)",
    },
    "Dark Theme": {
        "fs-icon-color-default": "#777",
        "fs-icon-color-warning": "yellow",
        "fs-icon-color-error": "red",
        "fs-icon-color-confirm": "green",
        "fs-icon-color-selected": "blue",
        "fs-icon-color-active": "rgba(0,0,0,0.87)",
    }
}

type ThemeKey = keyof typeof themes;

export function styleChanger(themeName?: ThemeKey) {
    if (!themeName) { 
        themeName = Object.keys(themes)[0] as ThemeKey; 
    }
    const theme = themes[themeName] || false;
    if (!theme) { return; }
    for (let key in theme) {
        document.documentElement.style.setProperty(`--${key}`, theme[key]);
    }
}

/*
const Themes = {
    "Light Theme": {
        "body-bg": "radial-gradient(circle, rgba(0,255,0,0.5) 0%, rgba(0,0,0,0.5) 100%)",
        "navbar-bg": "rgba(0,255,0,0.5)",
        "nav-bg-color": "rgba(255, 255, 0, 0.35)",
        "nav-border-color": "rgba(255, 255, 0, 0.35)",
        "nav-color": "rgba(0, 0, 0, 0.85)",
        "nav-shadow-color": "rgba(0, 0, 0, 0.2)",
        "nav-selected-shadow": "inset 0 0 20px #ff0",
        "nav-selected-color": "rgba(255, 255, 255, 0.95)",
        "nav-selected-shadow-color": "rgba(0, 0, 0, 0.5)",
        "nav-selected-border-color": "rgba(255, 255, 0, 1)",
        "timeline-bg": "linear-gradient(to bottom, #eef, #aaf)",
        "timelinesettings-label-color": "rgba(0,0,0,0.7)",
        "timelinesettings-input-bg": "linear-gradient(to bottom, #ffe, #ffc)",
        "timeline-shadow": "5px 5px 5px 5px rgba(0,0,0,0.5)",
        "timeline-refresh-color": "white",
        "timeline-refresh-bg": "linear-gradient(to bottom, rgba(200,200,255,0.5), rgba(100,100,255,0.5))",
        "timeline-refresh-hover-bg": "linear-gradient(to bottom, rgba(200,200,255,1), rgba(100,100,255,1))",
        "timeline-refresh-active-color": "#aaf",
        "timeline-refresh-active-bg": "linear-gradient(to bottom, rgba(255,100,100,1), rgba(255,200,200,1))",
        "timeline-h1-color": "#ffa",
        "tweet-bg": "rgba(255,255,255,0.75)",
        "misc-bg": "rgba(255,255,255,0.5)",
        "misc-border-color": "rgba(0,0,0,0.5)",
        "misc-shadow": "5px 5px 5px 5px rgba(0,0,0,0.5)",
        "font-family": "sans"
    },
    "Dark Theme": {
        "body-bg": "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAGElEQVQImQXBAQEAAACCIE/yf0pB1bAw7DPeBvon+i4DAAAAAElFTkSuQmCC) repeat",
        "navbar-bg": " rgba(0,0,0,0.85)",
        "nav-bg-color": "rgba(0, 0, 255, 0.65)",
        "nav-border-color": "rgba(0, 0, 200, 1)",
        "nav-color": "rgba(100, 100, 255, 0.85)",
        "nav-shadow-color": "rgba(0, 0, 200, 0.2)",
        "nav-selected-shadow": "inset 0 0 20px #00f",
        "nav-selected-color": "rgba(255, 25, 255, 0.95)",
        "nav-selected-shadow-color": "rgba(0, 0, 0, 0.5)",
        "nav-selected-border-color": "rgba(0, 0, 255, 0.75)",
        "timeline-bg": "rgba(0,0,0,0.7)",
        "timeline-label-color": "rgba(255,255,255,0.7)",
        "timeline-shadow": "0 0 1px 1px rgba(200,200,200,0.3)",
        "timeline-refresh-color": "white",
        "timeline-refresh-bg": "linear-gradient(to bottom, rgba(200,200,200,0.5), rgba(100,100,100,0.5))",
        "timeline-refresh-hover-bg": "linear-gradient(to bottom, rgba(200,200,200,1), rgba(100,100,100,1))",
        "timeline-refresh-active-color": "#aaf",
        "timeline-refresh-active-bg": "linear-gradient(to bottom, rgba(100,100,100,1), rgba(200,200,200,1))",
        "timeline-h1-color": "rgba(255,255,255,0.75)",
        "timelinesettings-label-color": "rgba(255,255,255,0.7)",
        "timelinesettings-input-bg": "linear-gradient(to bottom, #eee, #ccc)",
        "tweet-bg": "rgba(255,255,255,0.7)",
        "misc-bg": "rgba(0,0,0,0.5)",
        "misc-border-color": "rgba(0,0,0,0.5)",
        "misc-shadow": "0 0 1px 1px rgba(200,200,200,0.3)",
        "font-family": "courier"
    }
}
*/