import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';
import { Prop } from 'vue-property-decorator';

@Component
export class SkToggleComponent extends tsx.Component<{}> {
    @Prop()
    public value!: boolean;

    protected get classes() {
        return {
            'sk-toggle': true,
            'sk-toggle_value_on': this.value,
            'sk-toggle_value_off': !this.value,
        };
    }

    protected toggle() {
        this.$emit('input', !this.value);
    }

    render() {
        return (
            <button class={this.classes} onClick={() => this.toggle()} type="button">
                <div class="sk-toggle__text">{this.$slots.default}</div>
                <div class="sk-toggle__pimp-area">
                    <div class="sk-toggle__pimp"></div>
                </div>
            </button>
        );
    }
}
