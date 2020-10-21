import * as tsx from 'vue-tsx-support';
import Component from 'vue-class-component';
import { Prop, Watch } from 'vue-property-decorator';
import { VNode } from 'vue';

import { SkPhoneInputComponent } from './SkPhoneInputComponent';
import { SkIconCross } from '../icons/SkIconCross';
import { SkIconClear } from '../icons/SkIconClear';

export type SkPhoneComponentProps = {
    value: string;
    label: string;
};

@Component({})
export class SkPhoneComponent extends tsx.Component<SkPhoneComponentProps> {
    @Prop()
    protected readonly value!: string;

    @Prop({ default: 'Телефон' })
    protected readonly label!: string;

    @Prop({ default: null })
    protected readonly valid!: boolean | null;

    protected actualValue: string = '';
    protected isFocused: boolean = false;

    @Watch('value', { immediate: true })
    protected __onValueSpecified(newValue: string) {
        this.actualValue = newValue;
    }

    protected onFocus() {
        this.isFocused = true;
        this.$emit('focus');
    }

    protected onBlur() {
        this.isFocused = false;
        this.$emit('blur');
    }

    protected onInput(q: string) {
        this.$emit('input', this.actualValue);
    }

    public get classes() {
        return {
            'sk-phone': true,
            'sk-phone_focused': this.isFocused,
        };
    }

    render(): VNode {
        return (
            <div class={this.classes}>
                <label class="sk-phone__group sk-input-group">
                    <SkPhoneInputComponent
                        ref="phoneInput"
                        class="sk-input-group__input"
                        valid={this.valid}
                        vModel={this.actualValue}
                        onInput={(q: string) => this.onInput(q)}
                        onFocus={() => this.onFocus()}
                        onBlur={() => this.onBlur()}
                    />
                    <div class="sk-input-group__label">
                        <div class="sk-input-group__label-text">{this.label}</div>
                    </div>
                </label>
                <div
                    class="sk-phone__clear"
                    onMousedown={(e: Event) => e.preventDefault()}
                    onClick={() => {
                        this.actualValue = '';
                        if (this.$refs.phoneInput) {
                            (this.$refs.phoneInput as SkPhoneInputComponent).clearIncomplete();
                        }
                        this.$emit('input', '');
                    }}
                >
                    <SkIconClear />
                </div>
            </div>
        );
    }
}
