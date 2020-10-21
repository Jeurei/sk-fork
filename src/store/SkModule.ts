import { Module, VuexModule, Action, getModule, Mutation } from 'vuex-module-decorators';

import { OrderState, StateIds, TRoute, TAddress, TCoords, Overprice, Crew, Car } from '@model';
import { Api, TmApiError } from '@api';

import { store } from './store';
import { skConfigModule } from './SkConfigModule';

function getRouteCoords(orderState: OrderState): TCoords[] {
    return [
        {
            lat: orderState.source_lat,
            lon: orderState.source_lon,
        },
        ...orderState.stops.map(x => ({ lat: x.lat, lon: x.lon })),
        {
            lat: orderState.destination_lat,
            lon: orderState.destination_lon,
        }
    ];
}

function getRouteKey(coords: TCoords[]): string {
    return coords.map(x => `[${x.lat},${x.lon}]`).join(',');
}

function getCarKey(orderState: OrderState): string {
    if (orderState.car_id) {
        return `car_${orderState.car_id}`;
    }

    if (orderState.crew_id) {
        return `crew_${orderState.crew_id}`;
    }

    if (orderState.prior_crew_id) {
        return `crew_${orderState.prior_crew_id}`;
    }

    return '';
}

@Module({ dynamic: true, store, name: 'sk', namespaced: true })
export class SkModule extends VuexModule {
    skOrderId: number = 0;
    skOrderState: OrderState | null = null;
    skDriverTimeCount: number | null = null;
    skPrice: number = 0;
    skRoute: TRoute | null = null;

    skCar: Car | null = null;
    skCarPromise: Promise<Car | null> | null = null;

    public get overprice() {
        if (!this.skOrderState) {
            return null;
        }

        let overprices = this.skOrderState.order_params.map(x => skConfigModule.overpriceOptionsAfterOrderCreated.find(y => y.id === x)).filter(x => !!x);
        if (overprices.length === 0) {
            return null;
        }

        return overprices[0];
    }

    public get canChangeOverprice() {
        if (!this.skOrderState) {
            return false;
        }

        switch (this.skOrderState.state_id) {
            case StateIds.SentToDriver:
            case StateIds.ReadByDriver:
                return true;
        }

        switch (this.skOrderState.state_kind) {
            case 'new_order':
                return !this.skCar;
            default:
                return false;
        }
    }

    @Mutation
    public skSetOrderId(orderId: number) {
        if (this.skOrderId !== orderId) {
            this.skOrderState = null;
            this.skPrice = 0;
        }
        this.skOrderId = orderId;
    }

    @Mutation
    public skSetOrderState(orderState: OrderState | null) {
        this.skOrderState = orderState;
    }

    @Mutation
    public skSetPrice(price: number) {
        this.skPrice = price;
    }

    @Mutation
    public skSetDriverTimeCount(driverTimeCount: number | null) {
        this.skDriverTimeCount = driverTimeCount;
    }

    @Mutation
    public skSetRoute(route: TRoute | null) {
        this.skRoute = route;
    }

    @Mutation
    public skSetCar(car: Car | null) {
        this.skCar = car;
    }

    @Mutation
    public skSetCarPromise(promise: Promise<Car | null> | null) {
        this.skCarPromise = promise;
    }

    @Action
    public async applyOverprice(overprice: Overprice | null) {
        if (!this.skOrderState) {
            throw new Error('Order state not loaded');
        }

        if (!overprice || overprice.id === 0) {
            overprice = null;
        }

        let currentOrderParams = this.skOrderState.order_params;
        let currentOverprices = currentOrderParams.map(x => skConfigModule.overpriceOptionsAfterOrderCreated.find(y => y.id === x)).filter(x => !!x) as Overprice[];
        let order_params = currentOrderParams.filter(x => currentOverprices.findIndex(y => y.id === x) === -1);

        let maxOverprice = currentOverprices.reduce((acc, x) => !acc ? x : (x.value > acc.value ? x : acc), null as Overprice | null);
        if (maxOverprice === null && (overprice === null)) {
            return;
        }

        if (maxOverprice !== null && (overprice === null || maxOverprice.value > overprice.value)) {
            throw new Error('Cannot reduce overprice');
        }

        if (overprice) {
            order_params.push(overprice.id);
        }

        let order_id = this.skOrderId;

        try {
            await Api.trash.updateOrder({
                order_id,
                order_params,
                auto_recalc_cost: true,
            });
        } finally {
            try {
                await this.skLoadOrderState();
            } catch (e) {}
        }
    }

    @Action
    public async skLoadOrderState() {
        let orderId = this.skOrderId;
        if (!this.skOrderId) {
            this.skSetOrderState(null);
            return null;
        }

        let orderState = null;
        try {
            orderState = await Api.trash.getOrderState(orderId);
            if (orderState.state_kind !== 'finished' && orderState.state_kind !== 'aborted') {
                try {
                    let currentOrders = await Api.trash.getCurrentOrdersByClientId(orderState.client_id);
                    let orderIsLost = currentOrders.indexOf(orderState.order_id) === -1;
                    if (orderIsLost) {
                        orderState.state_id = StateIds.PseudoNotFound;
                        orderState.state_kind = 'aborted';
                    }
                } catch (e) {
                    console.error(e);
                }
            }
        } catch (e) {
            if (e instanceof TmApiError) {
                if (e.code === 100) {
                    if (localStorage.getItem('sktaxi.orderId') === `${orderId}`) {
                        try {
                            await this.skForgetOrder();
                        } catch (e) {}
                    }
                }
            }

            throw e;
        }

        if (this.skOrderId === orderId) {
            this.skSetOrderState(orderState);
        }
        
        return orderState;
    }

    @Action
    public async skLoadPrice() {
        let orderId = this.skOrderId;
        if (!this.skOrderId) {
            this.skSetPrice(0);
            this.skSetDriverTimeCount(null);
            return 0;
        }

        let price = 0;
        let driverTimeCount = null;
        try {
            let info = await Api.trash.getInfoByOrderId(orderId, ['DISCOUNTEDSUMM', 'DRIVER_TIMECOUNT']);
            price = parseInt(info.DISCOUNTEDSUMM || '0', 10) || 0;
            driverTimeCount = parseInt(info.DRIVER_TIMECOUNT || '0', 10) || 0;
        } catch (e) {}

        if (this.skOrderId === orderId && price > 0) {
            this.skSetPrice(price);
            this.skSetDriverTimeCount(driverTimeCount);
        }
        
        return price;
    }

    @Action
    public async skCancelOrder() {
        let orderId = this.skOrderId;
        try {
            await Api.trash.changeOrderState(orderId, StateIds.AbortedBySite); // Отказ от заказа через сайт
        } catch (e) {
            console.error(e);
            return;
        }

        if (this.skOrderId === orderId) {
            this.skForgetOrder();
        }
    }

    @Action
    public async skApproveOrder() {
        let orderId = this.skOrderId;
        try {
            await Api.trash.changeOrderState(orderId, StateIds.ClientNoticed2); // Клиент оповещен
        } catch (e) {
            console.error(e);
            return;
        }
        let elem = document.getElementsByClassName('sk-order-status-controls__connect-client-and-driver')[0];
        (elem as HTMLElement)?.focus();
        this.skLoadOrderState();
    }

    @Action
    public async skIgoOrder() {
        let orderId = this.skOrderId;

        try {
            await Api.trash.changeOrderState(orderId, StateIds.ClientOut); // Выходят!!!
        } finally {
            try {
                await this.skLoadOrderState();
            } catch (e) {}
        }
    }

    @Action
    public async skConnectClientAndDriver() {
        let orderId = this.skOrderId;

        await Api.trash.connectClientAndDriver(orderId);
    }

    @Action 
    public async skForgetOrder() {
        localStorage.removeItem('sktaxi.orderId');
        this.skSetOrderId(0);
    }

    @Action 
    public async skSetOrder(id: number) {
        localStorage.setItem('sktaxi.orderId', `${id}`);
        this.skSetOrderId(id);
        this.skLoadOrderState();
        this.skLoadPrice();
    }

    @Action
    public async skLoadRoute() {
        // this.setBuildingRoute(false);

        this.skSetRoute(null);

        if (!this.skOrderState) {
            return;
        }

        let orderState = this.skOrderState;

        let coords: TCoords[] = getRouteCoords(orderState);
        let key = getRouteKey(coords);

        let addresses: TAddress[] = coords.map(x => ({
            city: '',
            address_source: 'tm',
            kind: 'house',
            street: '',
            house: '',
            coords: x,
            point: '',
            comment: ''
        }));

        let route = null;
        try {
            // this.setBuildingRoute(true);
            route = await Api.trash.analyzeRoute2(addresses, true);
        } catch (e) {
            return;
        } finally {
            // this.setBuildingRoute(false);
            let newKey = getRouteKey(getRouteCoords(this.skOrderState));
            if (key === newKey) {
                this.skSetRoute(route);
            }
        }
    }

    @Action
    public async skLoadCar() {
        let promise = (async () => {
            if (this.skOrderState === null) {
                return null;
            }
            let orderState = this.skOrderState;

            if (orderState.car_number) {
                return {
                    car_id: orderState.car_id,
                    color: orderState.car_color,
                    mark: orderState.car_mark,
                    model: orderState.car_model,
                    gos_number: orderState.car_number,
                };
            }

            let carId = orderState.car_id;

            if (!carId) {
                let crewId = orderState.crew_id || orderState.prior_crew_id;
                if (crewId) {
                    let crew: Crew<null>;
                    try {
                        crew = await Api.trash.getCrewInfo(crewId);
                        carId = crew.car_id;
                    } catch (e) {}
                }
            }

            if (!carId) {
                return null;
            }

            return await Api.trash.getCarInfo(carId);
        })();

        this.skSetCarPromise(promise);

        let car: Car | null = null;
        try {
            car = await promise;
        } finally {
            if (this.skCarPromise === promise) {
                this.skSetCar(car);
                this.skSetCarPromise(null);
            }
        }

        return car;
    }
}


export const skModule = getModule(SkModule);

let refreshStateAndScheduleTimer: number | null = null;
let refreshStateAndScheduleCondition = false;
async function refreshStateAndSchedule() {
    refreshStateAndScheduleCondition = true;
    try {
        if (skConfigModule.ready) {
            await Promise.all([
                skModule.skLoadOrderState(),
                skModule.skLoadPrice(),
            ]);
        }
    } catch (e) {
        console.error(e);
    }

    refreshStateAndScheduleTimer = setTimeout(refreshStateAndSchedule, 1000);
};
function stopRefreshStateAndSchedule() {
    refreshStateAndScheduleCondition = false;
    if (refreshStateAndScheduleTimer) {
        clearTimeout(refreshStateAndScheduleTimer);
        refreshStateAndScheduleTimer = null;
    }
}

store.watch(
    () => skModule.skOrderId,
    (orderId: number | null) => {
        if (orderId) {
            stopRefreshStateAndSchedule();
            refreshStateAndSchedule();
        } else {
            stopRefreshStateAndSchedule();
        }
    },
    { immediate: true }
);

let orderId = parseInt(localStorage.getItem('sktaxi.orderId') || '0', 10);
if (orderId > 0) {
    skModule.skSetOrderId(orderId);
    skModule.skLoadOrderState();
    skModule.skLoadPrice();
}

store.watch(
    () => skModule.skOrderState ? getRouteKey(getRouteCoords(skModule.skOrderState)) : '',
    () => {
        skModule.skLoadRoute();
    },
    { immediate: true }
);

store.watch(
    () => skModule.skOrderState ? getCarKey(skModule.skOrderState) : '',
    () => {
        skModule.skLoadCar();
    },
    { immediate: true }
);

// (function loadAgain() {
//     if (skModule.orderId) {
//         skModule.loadOrderState();
//     }
//     setTimeout(loadAgain, 1000);
// })();
