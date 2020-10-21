import * as tsx from 'vue-tsx-support';
import { Prop, Component } from 'vue-property-decorator';

export type SkTextInputComponentProps = {
    value: string;
    disabled?: boolean;
};

export type SkTextInputComponentEvents = {
    onInput: (s: string) => void;
    onFocus: () => void;
    onBlur: () => void;
};

@Component({
    model: {
        prop: 'value',
        event: 'input',
    },
})
export class SkTextInputComponent extends tsx.Component<SkTextInputComponentProps, SkTextInputComponentEvents> {
    @Prop()
    public readonly value!: string;

    @Prop()
    public readonly disabled!: boolean;

    protected focused: boolean = false;

    public $refs!: {
        input: HTMLInputElement;
    };

    public focus(select: boolean = false) {
        this.$refs.input.focus();
        if (select) {
            this.$refs.input.select();
        }
    }

    protected get classes() {
        return {
            'sk-text-input': true,
            'sk-text-input_focus': this.focused,
        };
    }

    render() {
        return (
            <input
                ref="input"
                class={this.classes}
                value={this.value}
                disabled={this.disabled}
                onInput={(e: Event) => {
                    this.$emit('input', (e.target as HTMLInputElement).value);
                }}
                onFocus={() => { this.focused = true; this.$emit('focus'); }}
                onBlur={() => { this.focused = false; this.$emit('blur'); }}
            />
        );
    }
}
