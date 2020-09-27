import { Component, Prop, h } from '@stencil/core';
import { IFSObject } from '../model/FSObject';
// import { IFileExplorer } from '../types/types';
// import { array2ArrayMap, sort, delay } from "../../../core/util/core";


@Component({
    tag: 'folder-view',
    styleUrl: 'folder-view.css',
    shadow: false
})

export class FolderView {

    @Prop()
    item: IFSObject;

    @Prop()
    onSuccess: (item: IFSObject) => Promise<void>;

    @Prop()
    onClose: () => void;

    @Prop()
    minimal: boolean;

    private onSave = (item: IFSObject) => {
        this.onSuccess(item)
            .then(() => this.onClose())
            .catch(console.error)
    }

    renderFullView = () => {
        const title = this.item.id ? 'Mappa átnevezése' : 'Új mappa létrehozása';
        return (
            <form-validator model={this.item} submit={this.onSave} validate-at='SUBMIT'>
                <h4>{title}</h4>
                <div>
                    <input name='name' />
                    <div class="error-message"></div>
                </div>
                <input type="submit" value='Ment' />
            </form-validator>            
        );
    }

    renderMinimalView = () => {
        const title = this.item.id ? 'Mappa átnevezése' : 'Új mappa létrehozása';
        return (
            <form-validator model={this.item} submit={this.onSave}>
                <div class="minimal">
                    <h4>{title}</h4>
                    <div class="input-container">
                        <input type="text" name='name' />
                        <div class="error-message"></div>
                    </div>
                    <input type="submit" value='Ment' />
                </div>
            </form-validator>
        );
    }

    render() {
        console.log(this)
        return (
            <div class="form-view-container">
                { this.minimal ? this.renderMinimalView() : this.renderFullView() }
            </div>
        );
    }
}
