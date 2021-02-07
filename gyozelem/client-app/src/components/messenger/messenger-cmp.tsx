import { Component, State, Element, Prop, h } from '@stencil/core';
import { Message } from '../../model/Message';
import { MessengerController } from './controller';
// import { translation } from '../../global/translation';
// import { iconList } from '../../icons/icons';
// import { DateEx } from '../../model/DateEx';
// import { globalStore } from '../../global/stores';
// import { UserRank } from '../../model/User';

type TabConfig = [string, () => void];

@Component({
    tag: 'messenger-cmp',
    styleUrl: 'messenger-cmp.css',
    shadow: false
})

export class MessangerCmp {
    @Element() el: HTMLDivElement;    
    @Prop() onMinimize: () => {};
    @State() state: object = {};

    private controller: MessengerController;
    private tabConfig: TabConfig[] = [
        ['Írás',     () => {}],
        ['Üzenetek', () => {}],
        ['Bezár',    () => this.controller.toggleWindow()],
    ];

    componentWillLoad() {
        this.controller = new MessengerController(this.el)
        // this.controller.forceUpdate = () => this.state = {};
        // some init if needed
    }

    disconnectedCallback() {
        this.controller.dispose();
        console.info('removed the event calendar from dom');
    }

    private renderMessageItem = (msg: Message) => {
        const { user, users } = this.controller.globalStore.state;
        const isMe = user.id === msg.createdBy;
        return (
            <div class={'message-item ' + (isMe ? 'me' : 'other-user')}>
                <div class='user-name'>
                    { isMe ? ('me') : (users.valueMap[msg.createdBy].displayName + ':') }
                </div>
                <div title={msg.createdAt.toMySQLDate()}>{msg.content}</div>
            </div>
        );
    }

    private renderWriteMode = () => {
        const { store, getMessagesFromActiveThread } = this.controller;
        const activeMessage = store.get('activeMessage');
        return (
            <section class="write-mode">
                <header class="message-text">
                    <form-validator class="new-message-form" model={activeMessage} submit={this.controller.sendMessage}>
                        <input type="text" name="content" />
                    </form-validator>
                </header>
                <main class="message-list">
                    {getMessagesFromActiveThread().map(this.renderMessageItem)}
                </main>
                <footer class='user-select-wrapper'>
                    <user-select onChanged={this.controller.getHistory} />
                </footer>
            </section>
        );
    }

    public render() {
        const { isVisible, store } = this.controller;
        const { activeTab } = store.state;
        return (
            <div class={`messenger ${isVisible ? '' : 'minimize'}` }>
                <section>
                    <header>
                        <ul>
                            {this.tabConfig.map(([label, cb]) => (<li key={label} onClick={cb}>{label}</li>))}
                        </ul>
                    </header>
                    <main>
                        {activeTab === 'message' && this.renderWriteMode()}
                    </main>
                </section>
            </div>
        );
    }
}