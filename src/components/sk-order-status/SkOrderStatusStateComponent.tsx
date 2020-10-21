import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support' ;
import { Prop } from 'vue-property-decorator';
import { VNode } from 'vue';

import { OrderState, StateIds, Car } from '@model';

import { SkIconLoading } from '../icons/SkIconLoading';
import { skModule, skConfigModule } from '@store';

export type SkOrderStatusStateComponentProps = {
    orderState: OrderState;
};

function pluralize(count: number, one: string, few: string, many: string): string {
    count = count % 100;
    if (count % 10 === 1 && count !== 11) {
        return one;
    } else if (count % 10 >= 2 && count % 10 <= 4 && (count < 10 || count >= 20)) {
        return few;
    } else {
        return many;
    }
}

@Component({})
export class SkOrderStatusStateComponent extends tsx.Component<SkOrderStatusStateComponentProps> {
    @Prop()
    protected orderState!: OrderState;

    @Prop()
    protected car!: Car | null;

    protected getContentForPrior(showCarInfo: boolean): string {
        let dateStr = ``;
        let m = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/.exec(`${this.orderState.source_time}`);
        if (m) {
            let date = new Date(
                parseInt(m[1], 10),
                parseInt(m[2], 10) - 1,
                parseInt(m[3], 10),
                parseInt(m[4], 10),
                parseInt(m[5], 10),
                parseInt(m[6], 10)
            );
            date.setHours(date.getHours() + this.orderState.server_time_offset);
            dateStr = [
                `${date.getFullYear()}`,
                '-',
                `${date.getMonth() + 1}`.replace(/^(\d)$/, '0$1'),
                '-',
                `${date.getDate()}`.replace(/^(\d)$/, '0$1'),
                ' ',
                `${date.getHours()}`.replace(/^(\d)$/, '0$1'),
                ':',
                `${date.getMinutes()}`.replace(/^(\d)$/, '0$1'),
            ].join('');
        }

        // if (this.orderState.state_kind === 'new_order') {
            // if (dateStr) {
            //     return `Ваш заказ принят. Ожидайте ${dateStr}`;
            // } else {
            //     return `Ваш заказ принят`;
            // }
        // }

        let carInfo = ''
        if (showCarInfo && this.car) {
            carInfo = [
                this.car.color,
                this.car.mark,
                this.car.model,
                this.car.gos_number,
            ].filter(x => !!x).join(' ');
        }

        if (carInfo) {
            if (dateStr) {
                return `К Вам подъедет ${carInfo}.\nОжидайте ${dateStr}`;
            }

            return `К Вам подъедет ${carInfo} в назначенное время`;
        }

        return `Ваш заказ принят. Ожидайте назначения автомобиля`;

        // if (dateStr) {
        //     return `Ваш заказ принят. Ожидайте ${dateStr}`;
        // }

        // return `Ваш заказ принят`;
    }

    protected getSearchingContent(): string | VNode | (string | VNode)[] {
        return [
            `Поиск машины`,
            <SkIconLoading class="sk-order-status-state__search-loading" />
        ];
    }

    protected getQueuedContent(): string | VNode | (string | VNode)[] {
        return `Ваш заказ принят, ожидайте информацию об автомобиле`;
    }

    protected getNotOutContent(): string | VNode | (string | VNode)[] {
        return `Пожалуйста, поторопитесь, в противном случае Ваш заказ будет отменён`;
    }

    protected getSoonContent(): string | VNode | (string | VNode)[] {
        let minutes = 'несколько минут';
        if (skModule.skDriverTimeCount !== null && skModule.skDriverTimeCount >= 2) {
            minutes = `${skModule.skDriverTimeCount} ${pluralize(skModule.skDriverTimeCount, 'минуту', 'минуты', 'минут')}`;
        }

        let carInfo = ''
        if (this.car) {
            carInfo = [
                this.car.color,
                this.car.mark,
                this.car.model,
                this.car.gos_number,
            ].filter(x => !!x).join(' ');
        }
        if (skModule.skDriverTimeCount !== null && skModule.skDriverTimeCount >= 2) {
             return `К Вам подъедет ${carInfo || 'машина'} через ${minutes}`;
        }  else {
            return `Выходите, к Вам подъезжает ${carInfo || 'машина'}`;
        }
    }

    protected getOnPlaceContent() {
        let carInfo = ''
        if (this.car) {
            carInfo = [
                this.car.color,
                this.car.mark,
                this.car.model,
                this.car.gos_number,
            ].filter(x => !!x).join(' ');
        }

        return `Вас ожидает ${carInfo || 'машина'}`;
    }

    protected getContent() {
        switch (this.orderState.state_id) {
            case StateIds.DriverAcceptedByTime:
                return this.getContentForPrior(true);

            // case StateIds.DriverWannaCancelEarly:
            //     break;

            case StateIds.SentToDriver:
            case StateIds.ReadByDriver:
                return this.getSearchingContent();

            case StateIds.Queued:
                return this.getQueuedContent();

            case StateIds.ClientNotOut:
                return this.getNotOutContent();
            
            case StateIds.ClientOut:
                return this.getOnPlaceContent();

            case StateIds.DriverAccepted:
                return this.getSoonContent();

            case StateIds.ClientNoticed:
            case StateIds.ClientNoticed2:
                return this.getSoonContent();
        }

        switch (this.orderState.state_kind) {
            case 'new_order':
                if (this.orderState.is_really_prior) {
                    return this.getContentForPrior(true); // false?
                }
                return this.getSearchingContent();

            case 'driver_assigned':
                if (this.orderState.is_really_prior) {
                    return this.getContentForPrior(true);
                }

                // return this.getSearchingContent();
                return this.getSoonContent();

            case 'car_at_place':
                return this.getOnPlaceContent();

            case 'client_inside':
                return `Приятного пути!`;

            case 'finished':
                return `Надеемся, Вам понравилось!`;

            case 'aborted':
                return `Заказ отменен`;
        }
    }

    protected get content() {
        return this.getContent();
    }

    render() {
        return <div class="sk-order-status-state">
            <div class="sk-order-status-state__header">Статус заказа</div>
            <div class="sk-order-status-state__panel sk-panel">
                <div class="sk-order-status-state__text">{this.content}</div>
            </div>
        </div>
    }
}
