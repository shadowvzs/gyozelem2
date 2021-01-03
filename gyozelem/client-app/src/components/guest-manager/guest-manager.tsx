import { Component, Prop, h, State } from '@stencil/core';
import { GuestManagerController } from './controller';
import Guest from '../../model/Guest';
import { iconList } from '../../icons/icons';

@Component({
    tag: 'guest-manager',
    styleUrl: 'guest-manager.css',
    shadow: false
})

export class GuestManager {

    private controller: GuestManagerController = new GuestManagerController();

    @Prop()
    onClose: () => void;

    @Prop()
    onSelect: (ids: string[]) => void;

    @State()
    protected state = {};

    @Prop()
    selectedIds: string[] = [];

    componentWillLoad() {
        this.controller.forceUpdate = () => this.state = {};
        this.controller.selectedIds = this.selectedIds;
        // some init if needed
    }

    disconnectedCallback() {
        this.controller.dispose();
        console.info('removed the guest manager from dom')
    }

    public renderGuest = (guest: Guest) => {
        const { 
            uiStore,
            selectedIds,
            cancelEditItem,
            deleteItem,
            editItem,
            updateItem,
            toggle,
            updateGuest,
        } = this.controller;

        const CancelIcon = iconList['Cancel'];
        const DeleteIcon = iconList['Delete'];
        const EditIcon = iconList['Edit'];
        const OkIcon = iconList['Ok'];
        const model = uiStore.get('editedItemId') === guest.id ? guest.clone() : undefined;
      
        const children = model ? (
            <form-validator class="update-guest-form" model={model} submit={updateGuest}>
                <div class="guest-item">
                    <input name="fullName" placeholder="Vendeg neve" /> 
                    <div class="form-actions">
                        <a onClick={() => updateItem(model)} class="active"><OkIcon /></a>
                        <a onClick={cancelEditItem} class="error"><CancelIcon /></a>
                    </div>
                </div>                       
            </form-validator>
        ) : (
            <div class="guest-item">
                <div>{guest.fullName}</div>
                <div class="form-actions">
                    <a onClick={() => editItem(guest)} class="active"><EditIcon /></a>
                    <a onClick={() => deleteItem(guest)} class="error"><DeleteIcon /></a>
                </div>
            </div>
        );

        return (
            <div class="guest-item-wrapper">
                <input 
                    type="checkbox" 
                    onChange={() => toggle(guest)}
                    checked={selectedIds.includes(guest.id)}
                />
                {children}
            </div>
        );
    }

    public render() {        
        const { 
            items,
            createGuest,
            uiStore,
            selectedIds
        } = this.controller;

        return (
            <div class='guest-manager'>
                { items.length > 0 && (
                    <main>
                        <div class="guest-list">
                            {items.map(this.renderGuest)}
                        </div>
                        <div style={{ marginTop: '8px', textAlign: 'center' }}>
                            <button 
                                class="select-btn" 
                                onClick={() => {
                                    this.onSelect(selectedIds);
                                    this.onClose();
                                }}
                            >Select</button>
                        </div>
                    </main>
                )}
                <footer>
                    <form-validator class="new-guest-form" model={uiStore.get('newGuest')} submit={createGuest}>
                        <div class="input-wrapper">
                            <input name="fullName" placeholder="Vendeg neve" /> 
                            <input class="lp-button" type="submit" value={'Letrehoz'} />
                        </div>                       
                    </form-validator>   
                </footer>
            </div>
        );
    }
}