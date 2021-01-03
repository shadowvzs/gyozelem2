import { Component, h } from '@stencil/core';

@Component({
    tag: 'youtube-info',
    styleUrl: 'youtube-info.css',
    shadow: true
})

export class YoutubeInfo {

    render() {
        return (
            <div class="youtube-info">
                We use YouTube API for the video list, if you watch the videos here then automatically agree with 
                <a href="https://www.youtube.com/t/terms" target="_blank"> YouTube Terms of Service (ToS) </a> 
                and with 
                <a href="https://policies.google.com/privacy" target="_blank">Google Privacy Policy</a>
            </div>
        );
    }
}
