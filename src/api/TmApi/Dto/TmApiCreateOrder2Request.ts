export type TmApiCreateOrder2Request = {
    phone: string;
    addresses: {
        address: string;
        lat: number;
        lon: number;
        parking_id: number;
        zone_id: number;
    }[];
    order_params: number[];
    comment: string;
    server_time_offset: number;
    source_time: string;
    is_prior: boolean;
    crew_group_id: number;
    tariff_id?: number;
};
