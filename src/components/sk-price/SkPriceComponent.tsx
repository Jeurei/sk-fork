import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';
import { Prop } from 'vue-property-decorator';

export type SkPriceComponentProps = {
    price: number;
};

const NBSP = '\u00A0';

@Component({})
export class SkPriceComponent extends tsx.Component<SkPriceComponentProps> {
    @Prop()
    public price!: number;

    @Prop({ default: 0 })
    public minPrice!: number;

    @Prop({ default: false })
    public loading!: boolean;

    public get normalizedPrice() {
        if (this.price === 0) {
            return 0;
        }

        return Math.max(this.price, this.minPrice);
    }

    render() {
        return (
            <div class="sk-price">
                <div class="sk-price__label">Стоимость поездки</div>
                <div class="sk-price__value">{!this.loading ? '\u2248 ' + this.normalizedPrice.toFixed(2) + ' руб' : NBSP}</div>
            </div>
        );
    }
}
