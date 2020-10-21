import * as tsx from 'vue-tsx-support';
import { Prop, Component, Watch } from 'vue-property-decorator';
import { IMaskComponent } from 'vue-imask';

export type SkPhoneInputComponentProps = {
    value: string;
    disabled?: boolean;
};

export type SkPhoneInputComponentEvents = {
    onInput: (s: string) => void;
    onFocus: () => void;
    onBlur: () => void;
};

@Component({
    components: {
        'imask-input': IMaskComponent,
    },
    model: {
        prop: 'value',
        event: 'input',
    },
})
export class SkPhoneInputComponent extends tsx.Component<SkPhoneInputComponentProps, SkPhoneInputComponentEvents> {
    @Prop()
    public readonly value!: string;

    @Prop()
    public readonly disabled!: boolean;

    @Prop({ default: null })
    public readonly valid!: boolean | null;

    @Watch('value', { immediate: true })
    protected __onValueSpecidied(newValue: string) {
        this.incompleteValue = newValue;
    }

    protected focused: boolean = false;

    protected incompleteValue: string = '';

    public $refs!: {
        input: HTMLInputElement;
    };

    public focus() {
        this.$refs.input.focus();
    }

    public clearIncomplete() {
        this.incompleteValue = '';
    }

    protected get classes() {
        return {
            'sk-text-input': true,
            'sk-phone-input': true,
            'sk-text-input_focus': this.focused,
            // 'sk-text-input_invalid': this.valid === false,
            // 'sk-text-input_valid': this.valid === true,
        };
    }

    render() {
        return (
            <imask-input
                ref="input"
                class={this.classes}
                vModel={this.incompleteValue}
                mask="+{7} (000) 000-00-00"
                definitions={{ '#': /[0-79]/ }}
                unmask={true}
                disabled={this.disabled}
                onAccept={(value: string) => this.$emit('input', value !== '7' ? value : '')}
                onFocus={() => { this.focused = true; this.$emit('focus'); }}
                onBlur={() => { this.focused = false; this.$emit('blur'); }}
            />
        );
    }
}
