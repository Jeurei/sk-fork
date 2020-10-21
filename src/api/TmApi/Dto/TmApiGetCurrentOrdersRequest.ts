export type TmApiGetCurrentOrdersRequestByPhone = {
    phone: string;
};

export type TmApiGetCurrentOrdersRequestByClientId = {
    client_id: number;
};

export type TmApiGetCurrentOrdersRequest = TmApiGetCurrentOrdersRequestByPhone | TmApiGetCurrentOrdersRequestByClientId;
