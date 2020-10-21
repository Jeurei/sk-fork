import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';
import { Prop } from 'vue-property-decorator';

@Component({})
export class SkButtonComponent extends tsx.Component<{ disabled: boolean, tabindex: number | string }> {
    @Prop()
    public disabled!: boolean;

    render() {
        return <button class={{ 'sk-button': true, 'sk-button_disabled': this.disabled }}>{this.$slots.default}</button>
    }
}
