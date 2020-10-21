import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';
import { Prop, Watch } from 'vue-property-decorator';
import { OrderState, StateIds } from '@model';
import { skModule, skFormModule } from '@store';
import { SkIconDispatcher } from '../icons/SkIconDispatcher';
import { SkIconLoading } from '../icons/SkIconLoading';
import { SkDialogComponent } from '../sk-dialog-service/SkDialogService';
import { SkIconWarning } from '../icons/SkIconWarning';
import { Api } from '@api';
import { VNode } from 'vue';

@Component({})
export class SkHeaderComponent extends tsx.Component<{}> {
    protected get orderState() {
        return skModule.skOrderState;
    }

    protected showInvalidPhone: boolean = false;
    protected callingDispatcher: boolean = false;

    protected async callDispatcher() {
        if (this.callingDispatcher) {
            return;
        }

        if (this.orderState) {
            try {
                this.callingDispatcher = true;
                await Api.trash.callDispatcher(this.orderState.phone);
            } catch (e) {
                // TODO
                console.error(e);
            } finally {
                this.callingDispatcher = false;
            }
            
            return;
        }

        if (!skFormModule.isValidPhone) {
            this.showInvalidPhone = true;
            return;
        }

        try {
            this.callingDispatcher = true;
            await Api.trash.callDispatcher(skFormModule.phone);
        } catch (e) {
            // TODO
            console.error(e);
        } finally {
            this.callingDispatcher = false;
        }
    }

    protected showCancelSearch: boolean = false;

    protected async cancelSearch() {
        try {
            await skModule.skCancelOrder();
            this.showCancelSearch = false;
        } catch (e) {}
    }

    protected showCancelOrder: boolean = false;

    protected async cancelOrder() {
        try {
            await skModule.skCancelOrder();
            this.showCancelOrder = false;
        } catch (e) {}
    }

    protected get stateKind() {
        return skModule.skOrderState ? skModule.skOrderState.state_kind : null;
    }

    @Watch('stateKind')
    protected __onStateKindChanged(newStateKind: string | null, oldStateKind: string | null) {
        if (['driver_assigned', 'car_at_place'].indexOf(newStateKind || '') !== -1) {
            if (this.showCancelSearch) {
                this.showCancelSearch = false;
                this.showCancelOrder = true;
            }
        } else {
            this.showCancelOrder = false;
        }

        if (newStateKind !== 'new_order') {
            this.showCancelSearch = false;
        }
    }

    render() {
        let logoPlace: VNode | VNode[] = [];

        switch (this.orderState?.state_kind) {
            // case StateIds.Created:
            case 'new_order':
                logoPlace = (
                    <div class="sk-header__cancel-search">
                        <button
                            tabindex="10"
                            type="button"
                            class="sk-button sk-button_secondary sk-button_case_upper"
                            onClick={(e: Event) => {
                                e.preventDefault();
                                this.showCancelSearch = true;
                            }}
                        >
                            Отменить поиск
                        </button>
                    </div>
                );
                break;

            case 'driver_assigned':
            case 'car_at_place':
                logoPlace = (
                    <div class="sk-header__cancel-order">
                        <button
                            type="button"
                            tabindex="10"
                            class="sk-button sk-button_secondary sk-button_case_upper"
                            onClick={(e: Event) => {
                                e.preventDefault();
                                let elem = document.getElementsByClassName('fix-class-1')[0];
                                (elem as HTMLElement)?.focus();
                                this.showCancelOrder = true;
                            }}
                        >
                            Отменить заказ
                        </button>
                    </div>
                );
                break;
                
            case 'client_inside':
            case 'finished':
                logoPlace = (
                    <div class="sk-header__done">
                        <button
                            type="button"
                            class="sk-button sk-button_success sk-button_case_upper"
                            onClick={(e: Event) => {
                                e.preventDefault();
                                skModule.skForgetOrder();
                            }}
                        >
                            <span class="icon icon-done"></span>
                            OK
                        </button>
                    </div>
                );
                break;

            default:
                logoPlace = (
                    <div class="sk-header__logo">ЗАКАЗ ТАКСИ ОНЛАЙН</div>
                );
                break;
        }

        return (
            <div class="sk-header">
                {logoPlace}
                {
                    skModule.skOrderState
                    ? (
                        <div class="sk-header__call">
                            <button tabindex="9" type="button" class="sk-button sk-button_dispatcher" onClick={() => this.callDispatcher()}>
                                {(
                                    !this.callingDispatcher
                                    ? <SkIconDispatcher class="sk-header__call-icon" />
                                    : <SkIconLoading class="sk-header__call-icon" />
                                )}
                                <span class="sk-header__call-text">Связь с диспетчером</span>
                            </button>
                        </div>
                    )
                    : []
                }
                
                
                <SkDialogComponent show={this.showInvalidPhone} onClose={() => this.showInvalidPhone = false }>
                    <div class="sk-dialog-warning">
                        <SkIconWarning />
                    </div>
                    <div>Для связи с диспетчером укажите номер телефона</div>

                    <template slot="buttons">
                        <button type="button" class="sk-dialog__button" onClick={() => this.showInvalidPhone = false}>ОК</button>
                    </template>
                </SkDialogComponent>

                <SkDialogComponent show={this.showCancelSearch} onClose={() => this.showCancelSearch = false }>
                    <div>Вы действительно хотите отменить поиск?</div>

                    <template slot="buttons">
                        <button type="button" class="sk-dialog__button" autofocus tabindex="11" onClick={() => this.cancelSearch()}>Да</button>
                        <button type="button" class="sk-dialog__button" tabindex="12" onClick={() => this.showCancelSearch = false}>Нет</button>
                    </template>
                </SkDialogComponent>

                <SkDialogComponent show={this.showCancelOrder} onClose={() => this.showCancelOrder = false }>
                    <div>Вы действительно хотите отменить заказ?</div>

                    <template slot="buttons">
                        <button type="button" class="sk-dialog__button fix-class-1" autofocus tabindex="11" onClick={() => this.cancelOrder()}>Да</button>
                        <button type="button" class="sk-dialog__button" tabindex="12" onClick={() => this.showCancelOrder = false}>Нет</button>
                    </template>
                </SkDialogComponent>
            </div>
        );
    }
}
