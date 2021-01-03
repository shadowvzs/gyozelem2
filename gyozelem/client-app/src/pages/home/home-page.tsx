import { Component, h, Host } from '@stencil/core';

@Component({
    tag: 'home-page',
    styleUrl: 'home-page.css',
    shadow: false
})

export class HomePage {

    render() {
        return (
            <Host>
                <layout-cmp>
                    <main>
					    <img src="/assets/layout/logo.png" class="page_logo" />
						<div class="content">
							<div class="header">
								<h1 data-welcome-short="Isten hozott" data-welcome-medium="Isten hozott az oldalunkon" data-welcome-long="Isten hozott a Győzelem Gyülekezet oldalán"> </h1>
                                <br /><br />
								<div class="media">
									<div class="coverFrame">
										<div class="coverPicture"></div>
									</div>
									<div class="stickyNote">
										<h2>Berti</h2>
                                        <p>Drága testvéreink,
                                            szomorú szívvel tudatjuk, hogy drága testverünk, Dande Berti, az 
                                            Úrhoz költözött!
                                            Kérünk imádkozzatok Marika néniért!
                                        </p>
			                            <a href="*" data-action="toggle/cal_news"></a>
                                        <div class="calendarIcon">
                                            <a href="*" data-action="toggle/cal_news">
                                                <div class="calendar-icon icon-48"></div>
                                            </a>
										</div>
									</div>
                                </div>
								<br />
								<h2>Rólunk:</h2> Gyülekezetünk 15 éve jött létre és 7 helységben vannak gyülekezeteink: Nagyvárad, Szalonta, Székelyhíd, Monospetri, Bogyoszló, Margitta, Érmihályfalva.<br/><br/>
			                    <h2>Hitünk:</h2> Hiszünk az egy igaz Istenben, Jézus Krisztusban mint Isten fiában aki a mi megváltónk, a Szent Szellemben mint vígasztaló és tanító, a Bibliában mint Isten igéjeben ami Istentől ihletett útmutatónk.<br/><br/>
			                    <h2>Hitvallás:</h2> Jézus nem vallást teremtett hanem keresztény életformát, ez egy helyreállításról szól Isten és emberközt, nem ember által alkotott tradiciókra épül hanem egy élő kapcsolatra.<br/>Isten nem egy vallás, nem egy felekezet hanem egy személyes kapcsolat...<br/><br/>
			                    <h2>Célunk:</h2> Célunk, hogy emberek megtérjenek, megtapasztálják a Isten szeretetét, áldásait amit Jézus Krisztusban kijelentett az egész világ számára....<br/><br/>
							</div>
						</div>
                    </main>
                    <aside>
                        <main>
                            <bank-info />
                            <social-info />
                            <sermon-info />
                        </main>
                        <youtube-info />
					</aside>                    
                </layout-cmp>
            </Host>
        );
    }
}
/*
const styles = createStyles({
    stickyNote: {
        position: 'relative',
        height: 320,
        minWidth: 200,
        width: '100%',
        maxWidth: 250,
        color: 'rgba(0,0,0,0.7)',
        background: '#ffc',
        margin: '20px 0',
        padding: 10,
        fontSize: 16,
        fontFamily: "'Open Sans', sans-serif",
        border: '1px solid rgba(100,100,100,0.5)',
        borderRadius: 5,
        textShadow: '0.1em 0.1em 0.2em #aaa',
        display: 'inline-block',
        lineHeight: 21,
        boxShadow: '0 0 10px rgba(0,0,0,0.5)',
        overflow: 'hidden',
        textAlign: 'center',
        '& h2': {
            width: '100%',
            fontSize: 20,
            paddingBottom: 10,
            borderBottom: '1px solid rgba(0,0,0,0.5)',
            marginBottom: 10
        },    
        '& p': {
            position: 'absolute',
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            top: 55,
            left: 10,
            right: 10,
            bottom: 50,
            textAlign: 'left'
        },
        '& .nb-icon': {
            position: 'absolute',
            marginTop: 20,
            cursor: 'pointer',
            bottom: 10,
            right: 10,
            border: '1px dotted #aaa',
            borderRadius: 4
        }         
    }
});
*/