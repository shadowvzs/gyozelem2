import { Component, Host, h } from '@stencil/core';
import { UploadService, store } from '../../services/uploader-service';
import { IUploader } from './types';

const styles = {
    mini: {
        maxHeight: 0,
        overflow: 'hidden',
    }, 
    show: {
        top: '10px'
    }
};

@Component({
    tag: 'uploader-container',
    styleUrl: 'uploader.css',
    shadow: true
})

export class Uploader {

    private service = new UploadService();

    disconnectedCallback() {
        this.service.dispose();
    }

    renderListItem = ({ name, status }: { name: string, status: IUploader.Progress['status'] }) => {
        let statusClass: string = '';

        if (status === 'DONE') {
            statusClass = 'checked';
        } else if (status === 'ERROR') {
            statusClass = 'failed';
        }

        return (
            <tr key={name}>
                <td title={name}>{name}</td>
                <td> <div class={"icon checkbox " + statusClass}> </div> </td>
            </tr>
        );

    }

    render() {
        const { progress, status } = store.state;

        const maxFileCount = progress.length;
        const curFileCount = progress.filter(x => x.status !== 'QUEUE').length;

        const totalUploaded = progress.reduce((t, x) => t + x.uploaded, 0);
        const totalSize = progress.reduce((t, x) => t + x.size, 0);
        const perSize = totalSize > 0 ? Math.round(totalUploaded * 100 / totalSize) : 0;

        const style = {};
        if (store.get('miniMode')) { Object.assign(style, styles.mini); }
        if (status !== 'HIDDEN') { Object.assign(style, styles.show); }

        return (
            <Host style={style}>
                <div>
                    <header class='fu-head'>
                        <div>
                            <span>Upload </span>
                            <span>{curFileCount}</span> / <span>{maxFileCount}</span>
                        </div>
                        <div class="minimize" onClick={() => store.set('miniMode', !store.get('miniMode'))}>-</div>
                    </header>
                    <main class='fu-progress'>
                        <p data-value={perSize}>{status}</p>
                        <div class="fu-progress-container">
                            <span class="fu-progressbar" style={{ left: perSize - 100 + '%' }} />
                        </div>
                    </main>
                    { progress.length > 0 && (
                        <footer class='fu-file-list'>
                            <h6>File list</h6>
                            <table>
                                {progress.map(this.renderListItem)}
                            </table>
                        </footer>
                    )}
                </div>
                <div class='hidden' ref={$e => this.service.$inputContainer = $e}> </div>
            </Host>
        );
    }
}
