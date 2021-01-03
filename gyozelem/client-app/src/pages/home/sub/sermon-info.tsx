import { Component, h } from '@stencil/core';

@Component({
    tag: 'sermon-info',
    styleUrl: 'sermon-info.css',
    shadow: true
})

export class SermonInfo {

    render() {
        return (
            <div class="sermon-info">
                <h2 class="mt-2">Alkalmaink:</h2>
                <p class="mt-3 mb-2">
                    <p><b>Istentisztelet:</b> <span class="main-service">Vasárnap 16:00</span></p>
                    <p><b>Imaalkalom:</b> <span class="pray-service">Csütörtök 19:00</span></p>
                    <p><b>Imaéjszaka:</b> <span class="night-service">Minden hó utolsó szombata 19:00</span></p>
                </p>
                <p>
                    <b>Címünk:</b>
                    Románia, Nagyvárad/Oradea, Dunarea utca, 13-as szám.<br />
                    <a href="http://maps.google.ro/maps?hl=ro&amp;client=firefox-a&amp;hs=jOB&amp;rls=org.mozilla:en-GB:official&amp;q=oradea%20dunarii%2013&amp;um=1&amp;ie=UTF-8&amp;sa=N&amp;tab=wl"> google map </a> -
                    <a href="http://maps.google.ro/maps?f=q&amp;source=s_q&amp;hl=ro&amp;geocode=&amp;q=oradea+dunarii+13&amp;aq=&amp;sll=47.061791,21.934934&amp;sspn=0.007177,0.013797&amp;g=oradea+dunarea+13&amp;ie=UTF8&amp;hq=&amp;hnear=Strada+Dun%C4%83rea,+Oradea&amp;ll=47.061674,21.933931&amp;spn=0.001794,0.003449&amp;z=18&amp;layer=c&amp;cbll=47.061709,21.933823&amp;panoid=PxLWmzGtTo3-Es2FfLygjg&amp;cbp=12,19.47,,0,23.9">google map 2</a>
                </p>
                <b>Email cím:</b> office@gyozelem.ro
            </div>
        );
    }
}
