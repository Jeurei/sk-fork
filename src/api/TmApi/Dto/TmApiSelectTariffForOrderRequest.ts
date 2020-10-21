export type TmApiSelectTariffForOrderRequest = {
    crew_group_id: number,
    addresses: {
        lat: number,
        lon: number,
    }[],
};
