import { Component, State, h } from '@stencil/core';
import { globalStore } from '../../global/stores';

@Component({
    tag: 'app-root',
    styleUrl: 'app-root.css',
    shadow: false
})

export class AppRoot {

    @State()
    activeComponent: string = 'form-validator';

    render() {
        const loaded = globalStore.get('loaded');
        const user = globalStore.get('user');
        if (!loaded) {
            return (
                <div>loading</div>
            );
        }

        return (
            <stencil-router titleSuffix=" - My App">
                <stencil-route-switch scrollTopOffset={0}>
                    <stencil-route url="/" component="home-page" exact={true} />
                    <stencil-route url="/login" component="login-page" />
                    <stencil-route url="/signup" component="signup-page" />
                    <stencil-route component="page-not-found" />
                    {/*
                        <stencil-route url="/demos" component="demos-page" />
                        <stencil-route url="/other" component="other-page" />
                        <stencil-route component="page-not-found" />
                    */}
                </stencil-route-switch>
                <notify-container></notify-container>
                <panel-manager></panel-manager>
                { user && (<uploader-container></uploader-container>)}
                { user && (<context-menu></context-menu>)}
                { true && (<messenger-cmp></messenger-cmp>)}
            </stencil-router>
        );
    }
}
