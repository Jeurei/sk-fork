import { TAddress, TRoute, TCoords, OrderState, Crew, Car, TCustomizableAddress } from '@model';

import { AbstractTrashApi, CreateOrderParams, UpdateOrderParams } from '../Abstract/TrashApi';
import { TmApi, TmApiResponse } from '../TmApi';

export class TmApiError<T = any> extends Error {
    protected readonly response: TmApiResponse<T>;

    public get code() {
        return this.response.code;
    }
    public get descr() {
        return this.response.descr;
    }
    public get data() {
        return this.response.data as unknown;
    }

    constructor(response: TmApiResponse<T>) {
        super(response.descr);
        Object.setPrototypeOf(this, TmApiError.prototype);

        this.response = response;
    }
}

export class HttpTrashApi extends AbstractTrashApi {
    protected tmApi = new TmApi();

    // public async custom<T = any>(type: 'GET' | 'POST.url' | 'POST.json', method: string, payload: any): Promise<T> {
    //     let response = await this.tmApi.custom<T>(type, method, payload);
    //     return this.checkForError(response);
    // }

    public async analyzeRoute2(route: TCustomizableAddress[], get_full_route_coords: boolean): Promise<TRoute<TCustomizableAddress>>;
    public async analyzeRoute2(route: TAddress[], get_full_route_coords: boolean): Promise<TRoute<TAddress>>;
    public async analyzeRoute2(route: any[], get_full_route_coords: boolean): Promise<TRoute<any>> {
        let response = await this.tmApi.analyzeRoute2({
            get_full_route_coords,
            addresses: route.map((x) => ({
                address: x.house ? `${x.street}, ${x.house}` : `${x.street}`,
                lat: x.coords.lat,
                lon: x.coords.lon,
            })),
        });

        let data = this.checkForError(response);

        return {
            ...data,
            addresses: data.addresses.map((x, i) => ({
                address: route[i],
                info: {
                    lat: x.lat,
                    lon: x.lon,
                    zoneId: x.zone_id,
                    parkingId: x.parking_id,
                },
            })),
        };
    }

    public async getAddressesLike2(city: string, address: string): Promise<TAddress[]> {
        let response = await this.tmApi.getAddressesLike2({
            address,
            get_streets: true,
            get_points: true,
            get_houses: true,
            city,
        });

        let data = this.checkForError(response);

        return data.addresses;
    }

    public async createOrder2(request: CreateOrderParams): Promise<number> {
        let response = await this.tmApi.createOrder2(request);

        let data = this.checkForError(response);

        return data.order_id;
    }

    public async updateOrder(request: UpdateOrderParams): Promise<void> {
        let response = await this.tmApi.updateOrder(request);

        this.checkForError(response);
    }

    public async getCurrentOrdersByClientId(clietId: number): Promise<number[]> {
        let response = await this.tmApi.getCurrentOrders({ client_id: clietId });

        let data = this.checkForError(response);

        return data.orders.map(x => x.id);
    }

    public async getOrderState(orderId: number): Promise<OrderState> {
        let response = await this.tmApi.getOrderState({ order_id: orderId });

        let data = this.checkForError(response);

        return data;
    }

    public async changeOrderState(orderId: number, newStateId: number): Promise<void> {
        let response = await this.tmApi.changeOrderState({ order_id: orderId, new_state: newStateId });

        this.checkForError(response);
    }

    public async getCrewInfo(crewId: number): Promise<Crew<null>> {
        let response = await this.tmApi.getCrewInfo({ crew_id: crewId });

        let data = this.checkForError(response);

        return {
            car: null,
            ...data,
        };
    }

    public async getCarInfo(carId: number): Promise<Car> {
        let response = await this.tmApi.getCarInfo({ car_id: carId });

        let data = this.checkForError(response);

        return data;
    }

    public async getInfoByOrderId(orderId: number, fields: string[]): Promise<{
        DISCOUNTEDSUMM?: string;
        DRIVER_TIMECOUNT?: string;
    }> {
        let response = await this.tmApi.getInfoByOrderId({
            ORDER_ID: orderId,
            FIELDS: fields.join('-'),
        });

        let data = this.checkForError(response);

        return data;
    }

    public async connectClientAndDriver(orderId: number): Promise<void> {
        let response = await this.tmApi.connectClientAndDriver({
            order_id: orderId,
        });

        this.checkForError(response);
    }

    protected checkForError<T>(response: TmApiResponse<T>): T {
        if (response.code === 0) {
            return response.data;
        }

        throw new TmApiError(response);
    }

    public async selectTariffForOrder(crewGroupId: number, addresses: TCoords[]): Promise<number> {
        let response = await this.tmApi.selectTariffForOrder(
            {
                crew_group_id: crewGroupId,
                addresses: addresses.map(x => ({
                    lat: x.lat,
                    lon: x.lon,
                })),
            }
        );

        let data = this.checkForError(response);

        return data.tariff_id;
    }

    public async calcOrderCost2(tariffId: number, route: TRoute, orderParams: number[]): Promise<number> {
        let request = {
            tariff_id: tariffId,
            src_lat: route.addresses[0].address.coords.lat,
            src_lon: route.addresses[0].address.coords.lon,
            source_zone_id: route.addresses[0].info.zoneId,
            dest_lat: route.addresses[route.addresses.length - 1].address.coords.lat,
            dest_lon: route.addresses[route.addresses.length - 1].address.coords.lon,
            dest_zone_id: route.addresses[route.addresses.length - 1].info.zoneId,
            stops: route.addresses.slice(1, route.addresses.length - 1).map(x => ({ lat: x.address.coords.lat, lon: x.address.coords.lon, zone_id: x.info.zoneId })),
            distance_city: route.city_dist,
            distance_country: route.country_dist,
            source_distance_country: route.source_country_dist,
            analyze_route: false,
            order_params: orderParams,
        };

        let response = await this.tmApi.calcOrderCost2(request);

        let data = this.checkForError(response);

        return data.sum;
    }

    public async calcOrderCost2WithoutRoute(tariffId: number, addresses: TAddress[], orderParams: number[]): Promise<number> {
        let request = {
            tariff_id: tariffId,
            src_lat: addresses[0].coords.lat,
            src_lon: addresses[0].coords.lon,
            dest_lat: addresses[addresses.length - 1].coords.lat,
            dest_lon: addresses[addresses.length - 1].coords.lon,
            stops: addresses.slice(1, addresses.length - 1).map(x => ({ lat: x.coords.lat, lon: x.coords.lon, zone_id: 0 })),
            analyze_route: true as true,
            order_params: orderParams,
        };

        let response = await this.tmApi.calcOrderCost2(request);

        let data = this.checkForError(response);

        return data.sum;
    }

    public async callDispatcher(phone: string): Promise<void> {
        let request = { phone };

        let response = await this.tmApi.callDispatcher(request);
        this.checkForError(response);
    }
}
