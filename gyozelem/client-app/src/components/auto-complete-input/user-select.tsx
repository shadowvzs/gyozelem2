import { Component, Prop, State, h } from '@stencil/core';
import { globalStore } from '../../global/stores';

export type IOption = string | [string, string];

@Component({
    tag: 'user-select',
    // styleUrl: 'user-select.css',
    shadow: false
})

export class UserSelect {

    // @Element() el: HTMLElement;
    // @Prop() inputProps: Record<string, any>;
    // @Prop() items:    string[] = [];
    // @Prop() value:    string | string[];
    @Prop() multiSelect: boolean = true;
    @Prop() keepOpen:    boolean = false;
    @Prop() value:       string[];
    @Prop() onChanged:   (value: string[]) => void;
    @State() selectedUsers: string[];
    // @Prop() onSelect:         (value: string) => void;
    // @Prop() itemRender:       (value: string) => JSX.Element;
    // @Prop() suggestionRender: (value: string) => JSX.Element;
    // @State() showSuggestion:  boolean = false;

    public componentWillLoad() {
        this.selectedUsers = this.value || [];
    }

    private onSelect = (id: string) => {
        if (!this.multiSelect) {
            return this.selectedUsers = [id];
        }
        const idx = this.selectedUsers.indexOf(id);
        const list = [...this.selectedUsers];
        if (idx >= 0) {
            list.splice(idx, 1);
        } else {
            list.push(id);
        }
        if (this.onChanged) {
            this.onChanged(list);
        };
        this.selectedUsers = list;
    }

    private itemRender = (id: string) => {
        const users = globalStore.state.users;
        return users.valueMap[id]?.displayName || '';
    }

    render() {
        const users = globalStore.state.users;
        const userIds = users.map(x => x.id);

        return (
            <auto-complete-input
                singleLine={1}
                keepOpen={this.keepOpen}
                multiSelect={this.multiSelect}
                items={userIds}
                value={this.selectedUsers || []}
                onSelect={this.onSelect}
                itemRender={this.itemRender}
                valueRender={this.itemRender}
                inputProps={{ placeholder: 'Select user' }}
            />
        );
    }
}
