const setScrollBar = (container: HTMLDivElement): void => {
    const content: HTMLElement = container.querySelector(".content") as HTMLDivElement;
    const scrollBar: HTMLInputElement = container.querySelector("input[type=range]") as HTMLInputElement;

    if (!container || !content || !scrollBar) {
        return console.error('missing one or more dom element (ex. container[div], .content[div], .scrollBar[input=type[range]])');
    }

    const scrollHeight = content.scrollHeight;
    if (content.clientHeight === scrollHeight) { 
        scrollBar.onchange = null;
        content.onscroll = null;
        return;
    }

    const containerHeight = content.offsetHeight;
    const diffH = scrollHeight - containerHeight + 10;
    const scrllBrH = scrollBar.offsetHeight;
    const needScrollBar = scrollHeight > containerHeight;
    scrollBar.style.display = needScrollBar ? 'block' : 'none';

    container.classList[needScrollBar ? 'add' : 'remove']('scrolled');

    if (!needScrollBar) { 
        scrollBar.onchange = null;
        content.onscroll = null;
        return; 
    }

    scrollBar.style.width = containerHeight + 'px';
    scrollBar.style.right = (scrllBrH - containerHeight / 2 + 12)+'px';

    scrollBar.onchange = () => content.scrollTop = diffH / 100 * +scrollBar.value;
    content.onscroll = () => {
        const scTop = content.scrollTop;
        const max = content.scrollHeight - content.clientHeight;
        scrollBar.value = "" + (scTop === 0 ? 0 : 100 / scTop * max)
    };
};

// we store here the external dependencies, 
// if you use only 1 component then make sense to move here those functions/variables and not import it 
// or simple you can write here your own solutions for external functions :)

const externalDependencies = {
    setScrollBar,
};

export default externalDependencies;