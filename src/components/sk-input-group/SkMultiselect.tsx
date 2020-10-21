import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';
import SkScrollMultiselect from './SkScrollMultiselect';

@Component({
    inheritAttrs: false,
})
export class SkMultiselect extends tsx.Component<{}> {
    render() {
        return (
            <SkScrollMultiselect
                {...{props: this.$attrs}}
                class="sk-multiselect_scrollable"
                on={this.$listeners}
                scopedSlots={this.$scopedSlots}
            />
        );
    }
}
