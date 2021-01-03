import { Component, h } from '@stencil/core';

@Component({
    tag: 'social-info',
    styleUrl: 'social-info.css',
    shadow: true
})

export class SocialInfo {

    render() {
        return (
            <div class="social-info">
                <p>Követhet minket a követkző helyeken:</p>
                <div>
                    <h3 class="mt-4">Facebook:</h3>
                    <a class="fb-icon-wrapper" href="https://www.facebook.com/gyozelemgyulekezet" target="_blank">
                        <img width="48" height="48" src="data:image/png;base64,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" />
                    </a>
                </div>
                <div>
                    <h3 class="mt-4">YouTube:</h3>
                    <a class="yt-icon-wrapper" href="https://www.youtube.com/channel/UCju4wi5kFZ80lV8QHrm8lXg" target="_blank">
                        <svg style={{ width: "56px", paddingTop: "2px" }} version="1.0" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 158 110" enable-background="new 0 0 158 110" >
                        <path id="XMLID_142_" fill="#FF0000" d="M154.4,17.5c-1.8-6.7-7.1-12-13.9-13.8C128.2,0.5,79,0.5,79,0.5s-48.3-0.2-60.6,3  c-6.8,1.8-13.3,7.3-15.1,14C0,29.7,0.3,55,0.3,55S0,80.3,3.3,92.5c1.8,6.7,8.4,12.2,15.1,14c12.3,3.3,60.6,3,60.6,3s48.3,0.2,60.6-3  c6.8-1.8,13.1-7.3,14.9-14c3.3-12.1,3.3-37.5,3.3-37.5S157.7,29.7,154.4,17.5z"></path>
                        <polygon id="XMLID_824_" fill="#FFFFFF" points="63.9,79.2 103.2,55 63.9,30.8 "></polygon>
                        </svg>
                    </a>
                </div>
            </div>
        );
    }
}
