import { Component, State, h } from '@stencil/core';

@Component({
    tag: 'app-root',
    styleUrl: 'app-root.css',
    shadow: false
})

export class AppRoot {

    @State()
    activeComponent: string = 'form-validator';

    render() {
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
                <uploader-container></uploader-container>
                <panel-manager></panel-manager>
                <context-menu></context-menu>
            </stencil-router>
        );
    }
}
