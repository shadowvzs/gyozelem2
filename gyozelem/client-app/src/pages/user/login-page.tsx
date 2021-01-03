import { Component, h } from '@stencil/core';
import { LoginUserData } from '../../model/User';
import { layoutController } from '../layout/controller';

@Component({
    tag: 'login-page',
    styleUrl: 'login-page.css',
    shadow: false
})

export class LoginPage {
    render() {
        const loginUserData = new LoginUserData();

        return (
            <div class="login-page">
                <div class="layout video-background">
                    <video autoplay muted loop id="login-background">
                        <source src="/assets/layout/login_bg.mp4" type="video/mp4" />
                    </video>
                    <stencil-route-link url="/">
                        <img src="/assets/layout/logo.png" />
                    </stencil-route-link>                    
                </div>
                <div class="login-form-wrapper">
                    <form-validator class="login-form" model={loginUserData} submit={layoutController.login}>
                        <h3> Bejelentkezes </h3>
                        <div class="input-wrapper">
                            <input name="username" placeholder="Felhasznalo nev" /> 
                            <div class="input-info" />
                        </div>
                        <div class="input-wrapper">
                            <input name="password" type="password" placeholder="Jelszo" /> 
                            <div class="input-info" />
                        </div>                       
                        
                        <div class="lp-actions">
                            <input class="lp-button" type="submit" value={'Belepes'} />
                            <stencil-route-link class="lp-button" url="/"> Vissza </stencil-route-link>
                        </div>
                        <footer>
                            Nem vagyok tag az oldalon, <stencil-route-link url="/signup">Registralok</stencil-route-link>.
                        </footer>
                    </form-validator>
                </div>
            </div>
        );
    }
}
