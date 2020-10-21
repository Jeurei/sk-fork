import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';
import { VNode } from 'vue';
import { Inject, Prop, Watch } from 'vue-property-decorator';

export type IDialogSlots = {
    default?: VNode[];
    buttons?: VNode[];
};

export class DialogSlots implements IDialogSlots {
    public readonly key: string;
    public readonly default?: VNode[];
    public readonly buttons?: VNode[];

    constructor(slots: IDialogSlots, key?: string) {
        this.key = key || DialogSlots.generateKey();
        this.default = slots.default;
        this.buttons = slots.buttons;
    }

    public clone(slots: IDialogSlots) {
        return new DialogSlots(slots, this.key);
    }

    protected static nextKeyId = 1;
    protected static generateKey() {
        return `${DialogSlots.nextKeyId++}`;
    }
}

const dialogServices: Map<Vue, SkDialogServiceComponent> = new Map();

@Component({})
export class SkDialogServiceComponent extends tsx.Component<{}> {
    public dialogs!: DialogSlots[];

    addDialog(slots: DialogSlots) {
        let wrapper = new DialogSlots(slots);

        this.dialogs = [...this.dialogs, wrapper];
        this.$forceUpdate();
    }

    updateDialog(oldSlots: DialogSlots, slots: IDialogSlots) {
        let index = this.dialogs.findIndex((x) => x.key === oldSlots.key);

        if (index === -1) {
            let wrapper = oldSlots.clone(slots);
            this.dialogs.push(wrapper);
            index = this.dialogs.length - 1;
        } else {
            let wrapper = this.dialogs[index].clone(slots);
            this.dialogs.splice(index, 1, wrapper);
        }

        if (index === 0) {
            this.$forceUpdate();
        }
    }

    removeDialog(slots: DialogSlots) {
        this.dialogs = this.dialogs.filter((x) => x.key !== slots.key);
        this.$forceUpdate();
    }

    created() {
        this.dialogs = [];
        dialogServices.set(this.$parent, this);
    }

    beforeDestroy() {
        dialogServices.delete(this.$parent);
    }

    render() {
        let dialog = this.dialogs.length > 0 ? this.dialogs[0] : null;
        if (!dialog) {
            return;
        }

        return (
            <div class="sk-dialog">
                <div class="sk-dialog__body">
                    <div class="sk-dialog__content">{dialog.default}</div>
                    <div class="sk-dialog__buttons">{dialog.buttons}</div>
                </div>
            </div>
        );
    }
}

@Component({})
export class SkDialogComponent extends tsx.Component<{}> {
    @Inject('getDialogService')
    protected getDialogService?: () => SkDialogServiceComponent | null;

    @Prop({ default: true })
    public readonly show!: boolean;

    protected dialogSlots: DialogSlots = new DialogSlots({});

    protected findDialogService() {
        if (!this.getDialogService) {
            return null;
        }

        let dialogService = this.getDialogService();
        if (dialogService) {
            return dialogService;
        }

        return null;
    }

    @Watch('show', { immediate: true })
    protected __onShowSpecified(show: boolean) {
        if (show) {
            this.update();
        } else {
            this.remove();
        }
    }

    protected update() {
        if (!this.show) {
            return;
        }
        
        this.findDialogService()?.updateDialog(this.dialogSlots, {
            default: this.$slots.default,
            buttons: this.$slots.buttons
                ? this.$slots.buttons
                : [ <button class="sk-dialog__button" onClick={() => this.$emit('close')}>ОК</button> ],
        });
    }

    protected remove() {
        this.findDialogService()?.removeDialog(this.dialogSlots);
    }

    render() {
        this.update();
    }

    beforeDestroy() {
        this.remove();
    }
}
