import { Component, Prop, JSX, h, State, Watch } from '@stencil/core';
import { FSTypeEnum, IFSObject } from '../model/FSObject';
import { iconList } from './icons';

interface IconState {
    name?: string;
    height?: string;
    width?: string;
    label?: string;
    editMode?: boolean;
}

@Component({
    tag: 'fs-icon',
    styleUrl: 'fs-icon.css',
    shadow: true
})
export class FsIcon {

    @Prop() clickHandler: (item: IFSObject) => void;
    @Prop() isSelected?: (id: string) => boolean;
    @Prop() selectHandler: (item: IFSObject) => void;
    @Prop() onTitleChange: (newTitle: string, item?: IFSObject) => void;
    @Prop() onContextMenu: (event: MouseEvent, item?: IFSObject) => void;

    @Prop() singlelinelabel?: boolean;
    @Prop() isActive?: boolean;
    @Prop() fs: IFSObject;
    @Prop() name: string;
    @Prop() size: 'small' | 'normal' | 'big';
    @Prop() height: string;
    @Prop() width: string;
    @Prop() label: string;
    @Prop() align: 'bottom' | 'right';
    @Prop() editable: boolean;
    @Prop() color: 'default' | 'active' | 'warning' | 'error' | 'confirm' = 'default';


    @Watch('size')
    onSizeChange(size: 'small' | 'normal' | 'big') {
        let height: string = this.height;
        let width: string = this.width;
        switch (size) {
            case 'small':
                width = '24';
                height = '24';
                break;
            case 'normal':
                width = '32';
                height = '32';
                break;
            case 'big':
                width = '64';
                height = '64';
                break;
        }
        this.setState({ height, width });
    }

    @Watch('label')
    onChangeLabel(label: string) {
        this.setState({ label: this.fs ? this.fs.name : label });
    }

    @Watch('fs')
    onChangeName(fs: IFSObject) {
        let name: string;
        if (fs) {
            switch (fs.type) {
                case FSTypeEnum.FOLDER:
                    name = 'Folder';
                    break;
                case FSTypeEnum.DOCUMENT:
                    name = 'File';
                    break;
                case FSTypeEnum.UNKNOWN:
                    name = 'Unknown';
                    break;
                case FSTypeEnum.AUDIO:
                    name = 'File';
                    break;                    
                case FSTypeEnum.VIDEO:
                    name = 'File';
                    break;
                case FSTypeEnum.IMAGE:
                    name = 'File';
                    break;
            }
        }
        this.setState({ name: name || this.name });
    }
    
    @State() state: IconState = {};

    componentWillLoad() {
        this.onChangeName(this.fs);
        this.onChangeLabel(this.label)
 
        if (this.size) {
            this.onSizeChange(this.size);
        } else {
            const { width, height } = this;
            if (width) { this.setState({ width }); }
            if (height) { this.setState({ height }); }
        }
    }

    private setState = (state: Partial<IconState>) => {
        this.state = { ...this.state, ...state };
    }

    private toggleEditMode = () => {
        const editMode = !this.state.editMode;

        this.setState({ editMode });
    }

    private onSubmit = (event: Event) => {
        if (this.onTitleChange) { this.onTitleChange(this.state.label, this.fs); }
        this.toggleEditMode();
        event.preventDefault();
        event.stopPropagation();
    }

    private onChange = (event: Event) => {
        this.setState({ label: (event.target as HTMLInputElement).value });
    }

    renderLabel() {
        const { label = '', editMode, width } = this.state;
        return editMode ? (
            <div>
                <form onSubmit={this.onSubmit}>
                    <input type='text' value={label} onChange={this.onChange} style={{ width: width+'px' }} />
                </form>
            </div>
        ) : (
            <div 
                class={`title ${this.singlelinelabel ? 'single-line-label' : ''}`} 
                style={{ textDecoration: this.isActive ? 'underline': 'none' }}
                onClick={this.editable ? this.toggleEditMode : undefined}
            >
                {label}
            </div>
        );
    }

    renderIcon() {
        const { name, height, width } = this.state;
        if (this.fs?.type === FSTypeEnum.IMAGE && this.fs.url) {
            return (
                <div 
                    style={{ 
                        boxSizing: 'border-box',
                        width: width + 'px', 
                        height: height + 'px',
                        border: '1px solid rgba(0,0,0,0.2)',
                        background: `rgba(255,255,255,0.5) url("${this.fs.url}") center / contain no-repeat`
                    }}
                />
            )
        } else {
            const MyIcon: (props: Record<string, any>) => JSX.Element = iconList[name];
            const label = this.fs && this.fs.metaData && this.fs.metaData.extension.toLowerCase();
            return <MyIcon width={width} height={height} name={name} label={label} />;
        }        
    }

    render() {
        const classNames: string[] = ['icon-wrapper'];        
        if (this.align) { classNames.push('align-' + this.align); }
        if (this.editable) { classNames.push('edit'); }

        return (
            <div 
                class={classNames.join(' ')} 
                style={{ 
                    color: `var(--fs-icon-color-${this.color})`, 
                    justifyContent: this.align ? 'center' : 'flex-start',
                    width: this.singlelinelabel ? '100%' : 'auto'
                }} 
                onContextMenu={(event: MouseEvent) => this.onContextMenu(event, this.fs)}
            >
                { this.isSelected && <input type='checkbox' checked={this.isSelected(this.fs.id)} onClick={() => this.selectHandler(this.fs)} />}
                <span onClick={this.clickHandler ? () => this.clickHandler(this.fs) : undefined}>
                    {this.renderIcon()}                    
                </span>
                { this.state.label && <span class='label'> {this.renderLabel()} </span> }
            </div>
        );
    }
}
