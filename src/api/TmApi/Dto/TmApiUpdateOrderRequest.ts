export type TmApiUpdateOrderRequest = {
    order_id: number;
    order_params?: number[];
    auto_recalc_cost?: boolean;
};
