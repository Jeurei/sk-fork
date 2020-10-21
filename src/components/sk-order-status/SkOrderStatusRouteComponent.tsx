import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support' ;
import { Prop } from 'vue-property-decorator';

export type AddressEntry = {
    address: string;
    done: boolean;
}

export type SkOrderStatusRouteComponentProps = {
    addresses: AddressEntry[];
}

@Component({})
export class SkOrderStatusRouteComponent extends tsx.Component<SkOrderStatusRouteComponentProps> {
    @Prop()
    public addresses!: AddressEntry[];

    render() {
        return <div class="sk-order-status-route">
            <div class="sk-order-status-route__header">Маршрут</div>
            <div class="sk-order-status-route__addresses">
                {this.addresses.map((x, i) => (
                    <div class={{ 'sk-order-status-route__address sk-order-status-route-address': true, 'sk-order-status-route-address_done': x.done || i === 0 }}>
                        <div class="sk-order-status-route-address__icon"></div>
                        <div class="sk-order-status-route-address__text">{x.address}</div>
                    </div>
                ))}
            </div>
        </div>
    }
}
