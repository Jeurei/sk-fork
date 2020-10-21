import { TmApiResponse, TmApiGetAddressesLike2Request, TmApiGetAddressesLike2Response, TmApiAnalyzeRoute2Request, TmApiAnalyzeRoute2Response, TmApiCallDispatcherRequest, TmApiCallDispatcherResponse, TmApiCreateOrder2Request, TmApiCreateOrder2Response, TmApiUpdateOrderRequest, TmApiUpdateOrderResponse, TmApiGetOrderStateRequest, TmApiGetOrderStateResponse, TmApiChangeOrderStateRequest, TmApiChangeOrderStateResponse, TmApiGetCrewInfoRequest, TmApiGetCrewInfoResponse, TmApiGetCarInfoRequest, TmApiGetCarInfoResponse, TmApiGetInfoByOrderIdRequest, TmApiGetInfoByOrderIdResponse, TmApiConnectClientAndDriverRequest, TmApiConnectClientAndDriverResponse, TmApiSelectTariffForOrderRequest, TmApiSelectTariffForOrderResponse, TmApiCalcOrderCost2Request, TmApiCalcOrderCost2Response, TmApiGetCurrentOrdersRequest, TmApiGetCurrentOrdersRequestByPhone, TmApiGetCurrentOrdersResponse } from './Dto';

function patchPhone(phone: string) {
    return phone.replace(/^(?:\+?7|8)41147(\d{5})$/, '$1');
}

function repatchPhone(phone: string) {
    // yaebal
    return phone.replace(/^(\d{5})$/, '841147$1');
}

export class TmApi {
    // protected host = 'https://sk-taxi.ru/tmapi';
    protected host = '/tmapi';

    // public async custom<T = any>(type: 'GET' | 'POST.url' | 'POST.json', method: string, payload: any): Promise<TmApiResponse<T>> {
    //     return fetch(this.host + '/custom.php?method=' + encodeURIComponent(method) + '&type=' + encodeURIComponent(type), {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json;charset=utf-8',
    //         },
    //         body: JSON.stringify(payload),
    //     }).then(async (x) => await x.json()).then((x) => {
    //         if (!x || !Object.prototype.hasOwnProperty.call(x, 'code')) {
    //             return x;
    //         }

    //         return {
    //             ...x,
    //             code: parseInt(x.code, 10),
    //         };
    //     });
    // }

    protected async api<RQ, RS>(method: string, request: RQ): Promise<TmApiResponse<RS>> {
        return fetch(this.host + '/api.php?method=' + encodeURIComponent(method), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
            },
            body: JSON.stringify(request),
        }).then(async (x) => await x.json()).then((x) => {
            if (!x || !Object.prototype.hasOwnProperty.call(x, 'code')) {
                return x;
            }

            let code = x.code;

            if (typeof code === 'string') {
                let numCode = parseInt(x.code, 10);
                if (/^\d+$/.test(x.code) && !isNaN(numCode)) {
                    code = numCode;
                }
            }

            return {
                ...x,
                code,
            };
        });
    }

    public async analyzeRoute2(request: TmApiAnalyzeRoute2Request): Promise<TmApiResponse<TmApiAnalyzeRoute2Response>> {
        return this.api('/common_api/1.0/analyze_route2', request);
    }

    public async getAddressesLike2(request: TmApiGetAddressesLike2Request): Promise<TmApiResponse<TmApiGetAddressesLike2Response>> {
        return this.api('/common_api/1.0/get_addresses_like2', request);
    }

    public async createOrder2(request: TmApiCreateOrder2Request): Promise<TmApiResponse<TmApiCreateOrder2Response>> {
        let patchedRequest = {
            ...request,
            phone: patchPhone(request.phone),
        };
        return this.api('/common_api/1.0/create_order2', patchedRequest);
    }

    public async updateOrder(request: TmApiUpdateOrderRequest): Promise<TmApiResponse<TmApiUpdateOrderResponse>> {
        return this.api('/common_api/1.0/update_order', request);
    }

    public async getCurrentOrders(request: TmApiGetCurrentOrdersRequest): Promise<TmApiResponse<TmApiGetCurrentOrdersResponse>> {
        let patchedRequest = request;
        if ((request as TmApiGetCurrentOrdersRequestByPhone).phone) {
            patchedRequest = {
                ...request,
                phone: patchPhone((request as TmApiGetCurrentOrdersRequestByPhone).phone),
            };
        }
        return this.api('/common_api/1.0/get_current_orders', patchedRequest);
    }

    public async getOrderState(request: TmApiGetOrderStateRequest): Promise<TmApiResponse<TmApiGetOrderStateResponse>> {
        return this.api('/common_api/1.0/get_order_state', request);
    }

    public async changeOrderState(request: TmApiChangeOrderStateRequest): Promise<TmApiResponse<TmApiChangeOrderStateResponse>> {
        return this.api('/common_api/1.0/change_order_state', request);
    }

    public async getCrewInfo(request: TmApiGetCrewInfoRequest): Promise<TmApiResponse<TmApiGetCrewInfoResponse>> {
        return this.api('/common_api/1.0/get_crew_info', request);
    }

    public async getCarInfo(request: TmApiGetCarInfoRequest): Promise<TmApiResponse<TmApiGetCarInfoResponse>> {
        return this.api('/common_api/1.0/get_car_info', request);
    }

    public async getInfoByOrderId(request: TmApiGetInfoByOrderIdRequest): Promise<TmApiResponse<TmApiGetInfoByOrderIdResponse>> {
        return this.api('/tm_tapi/1.0/get_info_by_order_id', request);
    }

    public async connectClientAndDriver(request: TmApiConnectClientAndDriverRequest): Promise<TmApiResponse<TmApiConnectClientAndDriverResponse>> {
        return this.api('/tm_tapi/1.0/connect_client_and_driver', request);
    }

    public async selectTariffForOrder(request: TmApiSelectTariffForOrderRequest): Promise<TmApiResponse<TmApiSelectTariffForOrderResponse>> {
        return this.api('/common_api/1.0/select_tariff_for_order', request);
    }

    public async calcOrderCost2(request: TmApiCalcOrderCost2Request): Promise<TmApiResponse<TmApiCalcOrderCost2Response>> {
        return this.api('/common_api/1.0/calc_order_cost2', request);
    }

    public async callDispatcher(request: TmApiCallDispatcherRequest): Promise<TmApiResponse<TmApiCallDispatcherResponse>> {
        let patchedRequest = {
            ...request,
            phone: repatchPhone(request.phone),
        };

        return fetch(this.host + '/call-dispatcher.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
            },
            body: JSON.stringify(patchedRequest),
        }).then(async (x) => await x.json());
    }
}
