import { Component, h } from '@stencil/core';
import { SignUpUserData } from '../../model/User';
import { layoutController } from '../layout/controller';

@Component({
    tag: 'signup-page',
    styleUrl: 'signup-page.css',
    shadow: false
})

export class SignUpPage {
    render() {
        const signUpUserData = new SignUpUserData();

        return (
            <div class="signup-page">
                <div class="layout video-background">
                    <video autoplay muted loop id="signup-background">
                        <source src="/assets/layout/signup_bg.webm" type="video/webm" />
                    </video>
                    <stencil-route-link url="/"> 
                        <img src="/assets/layout/logo.png" />
                    </stencil-route-link>                    
                </div>
                <div class="signup-form-wrapper">
                    <form-validator class="signup-form" model={signUpUserData} submit={layoutController.signUp} errorSeparator='<br/>'>
                        <h3> Regisztracio </h3>
                        <div class="input-wrapper">
                            <input name="displayName" placeholder="Teljes nev" />
                            <div class="input-info" />
                        </div>
                        <div class="input-wrapper">
                            <input name="username" placeholder="Felhasznalo nev" />
                            <div class="input-info" />
                        </div>
                        <div class="input-wrapper">
                            <input name="email" type='email' placeholder="Email cim" /> 
                            <div class="input-info" />
                        </div>
                        <div class="input-wrapper">
                            <input name="password" type="password" placeholder="Jelszo" />
                            <div class="input-info" />
                        </div>
                        
                        <div class="lp-actions">
                            <input class="lp-button" type="submit" value={'Registracio'} />
                            <stencil-route-link url="/" class="lp-button"> Vissza </stencil-route-link>
                        </div>
                        <footer>
                            Mar van fiokom, <stencil-route-link url="/login">belepek</stencil-route-link>
                        </footer>
                    </form-validator>
                </div>
            </div>
        );
    }
}
