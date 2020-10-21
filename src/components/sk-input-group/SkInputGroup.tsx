import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';
import { VNode } from 'vue';

@Component({})
export class SkInputGroupComponent extends tsx.Component<{}> {
    public $slots!: {
        default: VNode[] | undefined;
        label: VNode[] | undefined;
        input: VNode[] | undefined;
    };

    render() {
        return (
            <label class="sk-input-group">
                {this.$slots.input}
                {this.$slots.default}
                <div class="sk-input-group__label">{this.$slots.label}</div>
            </label>
        );
    }
}
