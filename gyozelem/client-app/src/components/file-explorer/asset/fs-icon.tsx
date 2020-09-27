import { Component, Prop, JSX, h, State } from '@stencil/core';
import { FSTypeEnum, IFSObject } from '../model/FSObject';
import { contextMenu } from '../../context-menu';

const defaultProps = {
    fill: "currentColor",
}

const default24Props = {
    ...defaultProps,
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
};

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

    @Prop() fs: IFSObject;
    @Prop() name: string;
    @Prop() size: 'small' | 'normal' | 'big';
    @Prop() height: string;
    @Prop() width: string;
    @Prop() label: string;
    @Prop() align: 'bottom' | 'right';
    @Prop() editable: boolean;
    
    @State() state: IconState = {};

    componentWillLoad() {
        let name: string = this.name;
        let label: string = this.label;
        let height: string = this.height;
        let width: string = this.width;

        if (this.fs) {
            label = this.fs.name;
    
            switch (this.fs.type) {
                case FSTypeEnum.FOLDER:
                    name = 'Folder';
                    break;
                case FSTypeEnum.FOLDER:
                    name = 'File';
                    break;
            }
        }

        if (this.size) {
            switch (this.size) {
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
        }

        this.setState({ label, name, height, width });
    }

    private setState = (state: Partial<IconState>) => {
        this.state = {...this.state, ...state };
    }

    private toggleEditMode = () => {
        const editMode = !this.state.editMode;

        this.setState({ editMode });
    }

    private onSubmit = (event: Event) => {
        if (this.onTitleChange) { this.onTitleChange(this.state.label); }
        this.toggleEditMode();
        event.preventDefault();
        event.stopPropagation();
    }

    private onChange = (event: Event) => {
        this.setState({ label: (event.target as HTMLInputElement).value });
    }

    renderLabel() {
        const { label, editMode, width } = this.state;
        return editMode ? (
            <div>
                <form onSubmit={this.onSubmit}>
                    <input type='text' value={label} onChange={this.onChange} style={{ width: width+'px' }} />
                </form>
            </div>
        ) : (
            <div class='title' onClick={this.editable ? this.toggleEditMode : undefined}>{label}</div>
        );
    }

    render() {
        const { name, height, width } = this.state;
        const MyIcon: (props: Record<string, any>) => JSX.Element = iconList[name];
        const classNames: string[] = ['icon-wrapper'];
        
        if (this.align) { classNames.push('align-' + this.align); }
        if (this.editable) { classNames.push('edit'); }

        const menuList = [
            {
                label: 'Check this sub item',
                callback: (a: any) => console.table(a),
                data: this.fs
            }
        ]

        return (
            <div class={classNames.join(' ')} onContextMenu={contextMenu(menuList)}>
                { this.isSelected && <input type='checkbox' checked={this.isSelected(this.fs.id)} onClick={() => this.selectHandler(this.fs)} />}
                <span onClick={this.clickHandler ? () => this.clickHandler(this.fs) : undefined}>
                    <MyIcon width={width} height={height} />
                </span>
                { this.align && <span class='label'> {this.renderLabel()} </span> }
            </div>
        );
    }
}

type IconProps = Record<string, any>;

const iconList = {
    Home: ({ children, ...attrs }: IconProps): JSX.Element => {
        return (
            <svg {...default24Props} {...attrs}>
                <path d="M21 13v10h-6v-6h-6v6h-6v-10h-3l12-12 12 12h-3zm-1-5.907v-5.093h-3v2.093l3 3z" />
            </svg>  
        )
    },
    AddIntoFolder: ({ children, ...attrs }: IconProps): JSX.Element => {
        return (
            <svg {...default24Props} {...attrs}>
               <path d="M7 2c1.695 1.942 2.371 3 4 3h13v17h-24v-20h7zm6 11v-3h-2v3h-3v2h3v3h2v-3h3v-2h-3z"/>
            </svg>  
        )
    },
    Up: ({ children, ...attrs }: IconProps): JSX.Element => {
        return (
            <svg {...default24Props} {...attrs}>
                <path d="M7 11h-6l11-11 11 11h-6v13h-10z" />
            </svg>  
        )
    },
    Upload: ({ children, ...attrs }: IconProps): JSX.Element => {
        return (
            <svg {...default24Props} {...attrs}>
                <path d="M0 12c0 6.627 5.373 12 12 12s12-5.373 12-12-5.373-12-12-12-12 5.373-12 12zm18-1h-4v7h-4v-7h-4l6-6 6 6z"/>
            </svg>  
        )
    },
    Plus: ({ children, ...attrs }: IconProps): JSX.Element => {
        return (
            <svg {...default24Props} {...attrs}>
                <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6 13h-5v5h-2v-5h-5v-2h5v-5h2v5h5v2z" />
            </svg>  
        )
    },
    Folder: ({ children, ...attrs }: IconProps): JSX.Element => {
        return (
            <svg {...default24Props} {...attrs} viewBox="0 0 309.267 309.267">
                <path style={{fill: '#D0994B'}} d="M260.944,43.491H125.64c0,0-18.324-28.994-28.994-28.994H48.323c-10.67,0-19.329,8.65-19.329,19.329 v222.286c0,10.67,8.659,19.329,19.329,19.329h212.621c10.67,0,19.329-8.659,19.329-19.329V62.82 C280.273,52.15,271.614,43.491,260.944,43.491z"/>
                <path style={{fill: '#E4E7E7'}} d="M28.994,72.484h251.279v77.317H28.994V72.484z"/>
                <path style={{fill: '#F4B459'}} d="M19.329,91.814h270.609c10.67,0,19.329,8.65,19.329,19.329l-19.329,164.298 c0,10.67-8.659,19.329-19.329,19.329H38.658c-10.67,0-19.329-8.659-19.329-19.329L0,111.143C0,100.463,8.659,91.814,19.329,91.814z"/>
            </svg>  
        )
    },
    FolderOpen: ({ children, ...attrs }: IconProps): JSX.Element => {
        return (
            <svg {...default24Props} {...attrs} viewBox="0 0 58 58">
                <path style={{fill: '#EFCE4A'}} d="M46.324,52.5H1.565c-1.03,0-1.779-0.978-1.51-1.973l10.166-27.871 c0.184-0.682,0.803-1.156,1.51-1.156H56.49c1.03,0,1.51,0.984,1.51,1.973L47.834,51.344C47.65,52.026,47.031,52.5,46.324,52.5z"/>
                <path style={{fill: '#EBBA16'}} d="M50.268,12.5H25l-5-7H1.732C0.776,5.5,0,6.275,0,7.232V49.96c0.069,0.002,0.138,0.006,0.205,0.01 l10.015-27.314c0.184-0.683,0.803-1.156,1.51-1.156H52v-7.268C52,13.275,51.224,12.5,50.268,12.5z"/>
            </svg>  
        )
    },
    File: ({ children, ...attrs }: IconProps): JSX.Element => {
        return (
            <svg {...default24Props} {...attrs} viewBox="0 0 309.267 309.267">
                <path style={{fill: '#E4E7E7'}} d="M38.658,0h164.23l87.049,86.711v203.227c0,10.679-8.659,19.329-19.329,19.329H38.658 c-10.67,0-19.329-8.65-19.329-19.329V19.329C19.329,8.65,27.989,0,38.658,0z"/>
                <path style={{fill: '#C2C5C7'}} d="M289.658,86.981h-67.372c-10.67,0-19.329-8.659-19.329-19.329V0.193L289.658,86.981z"/>
                <path style={{fill: '#CCD0D2'}} d="M57.988,125.64v19.329H251.28V125.64H57.988z M57.988,183.637H251.28v-19.329H57.988V183.637z M57.988,222.286H251.28v-19.329H57.988V222.286z M57.988,260.944H251.28v-19.32H57.988V260.944z M164.298,86.981H57.988v19.329 h106.311L164.298,86.981L164.298,86.981z M164.298,48.323H57.988v19.329h106.311L164.298,48.323L164.298,48.323z"/>
            </svg>  
        )
    },
    Checked: ({ children, ...attrs }: IconProps) => {
        return (
            <svg {...default24Props} {...attrs} viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM17.99 9l-1.41-1.42-6.59 6.59-2.58-2.57-1.42 1.41 4 3.99z"></path>
            </svg>
        );
    },
    Unchecked: ({ children, ...attrs }: IconProps) => {
        return (
            <svg {...default24Props} {...attrs} viewBox="0 0 24 24">
                <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path>
            </svg>
        );
    }
}
