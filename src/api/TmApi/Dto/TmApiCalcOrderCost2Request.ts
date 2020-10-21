export type TmApiCalcOrderCost2RequestWithRoute = {
    tariff_id: number;
    src_lat: number;
    src_lon: number;
    source_zone_id: number;
    dest_lat: number;
    dest_lon: number;
    dest_zone_id: number;
    stops: { lat: number; lon: number; zone_id: number }[];
    distance_city: number;
    distance_country: number;
    source_distance_country: number;
    analyze_route: false;
    order_params: number[];
};

export type TmApiCalcOrderCost2RequestWithOutRoute = {
    tariff_id: number,
    src_lat: number,
    src_lon: number,
    dest_lat: number,
    dest_lon: number,
    stops: { lat: number, lon: number, zone_id: number }[],
    analyze_route: true,
    order_params: number[],
};

export type TmApiCalcOrderCost2Request = TmApiCalcOrderCost2RequestWithRoute | TmApiCalcOrderCost2RequestWithOutRoute;
