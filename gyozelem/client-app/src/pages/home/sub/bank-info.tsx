import { Component, h } from '@stencil/core';

@Component({
    tag: 'bank-info',
    styleUrl: 'bank-info.css',
    shadow: true
})

export class BankInfo {

    render() {
        return (
            <div class="bank-info">
                <p class="mb-3">Ha szeretnéd támogatni anyagilag a gyülekezetet vagy missziókat:</p>
                <h3 style={{ color: '#336' }}>Bank adress:</h3> BANCPOST S.A. str. Tudor Vladimirescu nr. 1
                <p class="mb-3">
                    <i><b>ASOCIATIA CENTRUL CRESTIN BIRUINTA</b></i> str. Dunarea nr.13 ORADEA RO
                </p>
                <p class="mb-2"><h3  style={{ color: '#336' }}>Bank account number:</h3> RO38BPOS05003108254ROL01</p>
                <p><span style={{ color: '#a00' }}><b>Swift code:</b></span> BPosRoBu</p>
            </div>
        );
    }
}
