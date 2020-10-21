import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';
import { Prop, Watch } from 'vue-property-decorator';
import { OrderState, StateIds, Car } from '@model';
import { skModule } from '@store';
import { SkDialogComponent } from '../sk-dialog-service/SkDialogService';
import { SkIconLoading } from '../icons/SkIconLoading';
import { SkIconClear } from '../icons/SkIconClear';
import { SkIconOk } from '../icons/SkIconOk';
import { SkIconDispatcher } from '../icons/SkIconDispatcher';


async function refreshFocus() {
    let elem = document.getElementsByClassName('sk-order-status-controls__connect-client-and-driver')[0];
    (elem as HTMLElement)?.focus();
}

export type SkOrderStatusControlsComponentProps = {
    orderState: OrderState;
};

@Component({})
export class SkOrderStatusControlsComponent extends tsx.Component<SkOrderStatusControlsComponentProps> {
    @Prop()
    protected orderState!: OrderState;

    @Prop()
    protected car!: Car | null;

    protected showCancelSearch: boolean = false;
    protected cancellingSearch: boolean = false;

    protected approvingOrder: boolean = false;
    protected callingDriver: boolean = false;
    protected settingIgo: boolean = false;
    protected forgettingOrder: boolean = false;

    protected async cancelSearch() {
        try {
            this.cancellingSearch = true;
            await skModule.skCancelOrder();
            this.showCancelSearch = false;
        } catch (e) {
            console.error(e);
        } finally {
            this.cancellingSearch = false;
        }
    }

    protected async approveOrder() {
        try {
            this.approvingOrder = true;
            setTimeout(refreshFocus, 1000); 
            await skModule.skApproveOrder();
        } catch (e) {
            console.error(e);
        } finally {
            this.approvingOrder = false;
        }
    }

    protected async connectClientAndDriver() {
        try {
            this.callingDriver = true;
            await skModule.skConnectClientAndDriver();
        } catch (e) {
            console.error(e);
        } finally {
            this.callingDriver = false;
        }
    }

    // I'm Going Out
    protected async igo() {
        try {
            this.settingIgo = true;
            await skModule.skIgoOrder();
        } catch (e) {
            console.error(e);
        } finally {
            this.settingIgo = false;
        }
    }

    protected async forgetOrder() {
        try {
            this.forgettingOrder = true;
            await skModule.skForgetOrder();
        } catch (e) {
            console.error(e);
        } finally {
            this.forgettingOrder = false;
        }
    }

    @Watch('stateKind')
    protected __onStateKindChanged(newStateKind: string, oldStateKind: string) {
        if (newStateKind !== 'new_order') {
            this.showCancelSearch = false;
        }
    }

    protected getCancelButton() {
        return (
            <button               
                type="button"
                tabindex="4"
                class="sk-button sk-button_secondary sk-order-status-controls__cancel"
                onClick={() => {
                    this.showCancelSearch = true;
                    let elem = document.getElementsByClassName('fix-class-1')[0];
                    (elem as HTMLElement)?.focus();
                }}
            >
                {
                    this.cancellingSearch
                    ? <SkIconLoading class="sk-button__pre-icon" />
                    : <SkIconClear class="sk-button__pre-icon" />
                }
                Отменить заказ
            </button>
        );
    }

    protected getApproveButton() {
        return (
            <button
                type="button"
                class="sk-button sk-button_secondary sk-order-status-controls__approve"
                autofocus
                tabindex="1"
                disabled={this.approvingOrder}
                onClick={() => {
                    this.approveOrder();
                }}
            >
                {
                    this.approvingOrder
                    ? <SkIconLoading class="sk-button__pre-icon" />
                    : <SkIconOk class="sk-button__pre-icon" />
                }
                Подтвердить
            </button>
        );
    }

    protected getCallDriverButton() {
        return (
            <button
                type="button"
                tabindex="2"
                class="sk-button sk-button_secondary sk-order-status-controls__connect-client-and-driver"
                onClick={async () => {
                    this.connectClientAndDriver();
                }}
            >
                {
                    this.callingDriver
                    ? <SkIconLoading class="sk-button__pre-icon" />
                    : <SkIconDispatcher class="sk-button__pre-icon" />
                }
                Связь с водителем
            </button>
        );
    }

    protected getIgoButton() {
        return (
            <button
                type="button"
                tabindex="1"
                autofocus
                class="sk-button sk-button_secondary sk-order-status-controls__igo"
                onClick={() => {
                    this.igo();
                }}
                disabled={this.orderState.state_id === StateIds.ClientOut}
            >
                {
                    this.settingIgo
                    ? <SkIconLoading class="sk-button__pre-icon" />
                    : <SkIconOk class="sk-button__pre-icon" />
                }
                Выхожу
            </button>
        );
    }

    protected getForgetButton() {
        return (
            <button
                type="button"
                tabindex="4"
                class="sk-button sk-button_secondary sk-order-status-controls__forget"
                onClick={() => {
                    this.forgetOrder();
                }}
            >
                {
                    this.forgettingOrder
                    ? <SkIconLoading class="sk-button__pre-icon" />
                    : <SkIconOk class="sk-button__pre-icon" />
                }
                OK
            </button>
        );
    }

    protected getFinishButton() {
        return (
            <button
                type="button"
                tabindex="4"
                class="sk-button sk-button_secondary sk-order-status-controls__finish"
                onClick={() => {
                    this.forgetOrder();
                }}
            >
                {
                    this.forgettingOrder
                    ? <SkIconLoading class="sk-button__pre-icon" />
                    : <SkIconOk class="sk-button__pre-icon" />
                }
                OK
            </button>
        );
    }

    getButtons() {
        switch (this.orderState.state_id) {
            case StateIds.DriverAcceptedByTime:
                return [
                    // this.getCancelButton(),
                    this.getCallDriverButton(),
                ];

            case StateIds.DriverWannaCancelEarly:
                return [
                    this.getCancelButton(),
                    this.getCallDriverButton(),
                ];

            case StateIds.SentToDriver:
            case StateIds.ReadByDriver:
                return [];

            case StateIds.Queued:
                return [];

            case StateIds.ClientNotOut:
                return [
                    this.getIgoButton(),
                    this.getCallDriverButton(),
                ];

            case StateIds.ClientOut:
                return [
                    this.getCallDriverButton(),
                ];

            case StateIds.DriverAccepted:
                return [
                    this.getApproveButton(),
                    this.getCallDriverButton(),
                ];

            case StateIds.ClientNoticed:
            case StateIds.ClientNoticed2:
                return [
                    this.getCallDriverButton(),
                ];
        }

        switch (this.orderState.state_kind) {
            case 'new_order':
                if (this.orderState.is_really_prior) {
                    return [
                        this.getCancelButton(),
                    ];
                }
                return [];

            case 'driver_assigned':
                return [
                    this.getCancelButton(),
                    this.getCallDriverButton(),
                ];

            case 'car_at_place':
                return [
                    this.getIgoButton(),
                    this.getCallDriverButton(),
                ];

            case 'client_inside':
                return [];

            case 'finished':
                return [
                    this.getFinishButton(),
                ];

            case 'aborted':
                return [
                    this.getForgetButton(),
                ];
        }

        return [];
    }

    render() {
        return (
            <div class="sk-order-status-controls">
                {this.getButtons()}

                {
                    this.showCancelSearch
                    ? <SkDialogComponent onClose={() => this.showCancelSearch = false }>
                        <div>Вы действительно хотите отменить поиск?</div>

                        <template slot="buttons">
                            <button class="sk-dialog__button" autofocus tabindex="4" onClick={() => this.cancelSearch()}>Да</button>
                            <button class="sk-dialog__button" tabindex="5" onClick={() => this.showCancelSearch = false}>Нет</button>
                        </template>
                    </SkDialogComponent>
                    : []
                }
            </div>
        );
    }
}
