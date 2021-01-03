import { Component, h, Prop } from '@stencil/core';
import { injectHistory, RouterHistory } from '@stencil/router';
import { globalStore } from '../../global/stores';
import { layoutController } from './controller';
import { menuItems, MenuPlace } from './menu';

@Component({
    tag: 'layout-cmp',
    styleUrl: 'layout-cmp.css',
    shadow: false
})

export class LayoutComponent {

    @Prop()
    history: RouterHistory;

    componentWillLoad() {
        globalStore.set('history', this.history);
    }

    private onClickHandler = (menuAction?: (event: MouseEvent) => void) => {
        if (!menuAction) return;
        return (e: MouseEvent) => {
            menuAction(e);
            e.stopPropagation();
            e.preventDefault();
            return false;
        }
    }
        
    renderBurgerMenu() {
        const items = menuItems.filter(x => Boolean(x.usedAt & MenuPlace.Burger) && x.visible(layoutController.loggedUser));

        return (
            <div class="burger">
                <input type="checkbox" id="burgerCheckbox" />
                <span class="burger-line"></span>
                <span class="burger-line"></span>
                <span class="burger-line"></span>
                <span class="burger-line"></span>
                <span id="burger_menu">
                    <nav>
                        {items.map(menu => (
                            <stencil-route-link url={menu.url} key={menu.id} onClick={this.onClickHandler(menu.action)} title={menu.tooltip}>
                                <span class="menuButton">
                                    <div class={`menu-icon ${menu.id}-icon`}></div>
                                </span>
                            </stencil-route-link>
                        ))}
                    </nav>
                </span>
            </div>
        );
    }

    renderNavBar() {
        const items = menuItems.filter(x => Boolean(x.usedAt & MenuPlace.NavBar) && x.visible(layoutController.loggedUser));
        return (
            <div class="menu">
                {items.map(menu => (
                    <stencil-route-link url={menu.url} key={menu.id} onClick={this.onClickHandler(menu.action)} title={menu.tooltip}>
                        <span class="menuButton">
                            <div class={`menu-icon ${menu.id}-icon`}></div>
                            <span class="buttonName"> {menu.label} </span>
                        </span>
                    </stencil-route-link>
                ))}
            </div>
        );
    }

    renderQuickBar() {
        const items = menuItems.filter(x => Boolean(x.usedAt & MenuPlace.QuickBar) && x.visible(layoutController.loggedUser));
        return (
            <div class="menu">
                {items.map(menu => (
                    <stencil-route-link url={menu.url} key={menu.id} onClick={this.onClickHandler(menu.action)} title={menu.tooltip}>
                        <div class={`menu-icon ${menu.id}-icon`}></div>
                    </stencil-route-link>
                ))}
            </div>
        );
    }

    render() {
        return (
            <div class="grid">
                <div class="header-line">
                    {this.renderBurgerMenu()}
                </div>
                <header>
                    <div class="shadow"></div>
                    <div class="log-menu">
                    {this.renderQuickBar()}
                    </div>
                    <picture>
                        <div 
                            class="igevers" 
                            data-mobil="...életét adta váltságul..." 
                            data-tablet="‘‘...a mi betegségeinket viselte, és a mi fájdalmainkat hordozta...’’
                                     (Ézs 53:4)" 
                            data-desktop="‘‘ Mert a keresztről való beszéd bolondság ugyan azoknak, a kik elvesznek; de nekünk, kik megtartatunk, Istennek ereje.’’
                                      (1Kor 1:18)" 
                            data-desktop-hd="‘‘ De hála Istennek, aki a diadalmat adja nekünk a mi Urunk Jézus Krisztus által!’’
                                      (1Kor 15:57)"
                        />
                    </picture>
                </header>
                <nav>
                    {this.renderNavBar()}
                </nav>
                
                <div class="content page">
                    <slot></slot>
                </div>
                <footer> © 2011-2021 by Varga Zsolt	</footer>
            </div>
        );
    }
}

injectHistory(LayoutComponent);