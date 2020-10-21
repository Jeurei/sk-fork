import { Component } from 'vue-property-decorator';
import { VNode } from 'vue';
import * as tsx from 'vue-tsx-support';

@Component({})
export class SkWrappedAddressComponent extends tsx.Component<{}> {
    render(): VNode | VNode[] {
        return <div />;
    }
}
