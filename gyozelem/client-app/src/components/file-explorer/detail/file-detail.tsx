import { Component, Prop, h } from '@stencil/core';
import { FSTypeEnum } from '../../../model/FSObject';

@Component({
    tag: 'file-detail',
    styleUrl: 'file-detail.css',
    shadow: true
})

export class DetailView {

    @Prop()
    item: any;// FSObject;

    renderFolder() {

        // const title = this.item.id ? 'Mappa átnevezése' : 'Új mappa létrehozása';

        return (
            <div>folder</div>
            //<Form className={fsDetailStyles.folderModal as string} onSubmit={onSubmit} model={model}>
            //    <h3> {title} </h3>
            //    <Input name="name" className="pt-2 pb-2" />
            //    <Input value="Ment" type="submit" />
            //</Form>
        );
    }

    render() {
        switch (this.item.type) {
            case FSTypeEnum.FOLDER:
                return this.renderFolder();
            default:
                return (<div>aaaa</div>);
        }
    }
}
