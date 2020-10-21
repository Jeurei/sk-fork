export type TmApiGetOrderStateResponse = {
    order_id: number;
    state_id: number;
    state_kind: 'new_order' | 'driver_assigned' | 'car_at_place' | 'client_inside' | 'finished' | 'aborted';
    confirmed: 'not_confirmed' | 'confirmed_by_driver' | 'confirmed_by_oper';
    order_params: number[];
    server_time_offset: number;

    client_id: number;
    phone: string;

    is_prior: boolean;
    is_really_prior: boolean;
    prior_crew_id: number;

    driver_id: number;

    car_id: number;
    car_mark: string;
    car_model: string;
    car_color: string;
    car_number: string;

    crew_id: number;
    crew_coords?: {
        lat: number;
        lon: number;
    };

    source: string;
    source_time: string;
    source_lat: number;
    source_lon: number;

    stops: {
        address: string;
        lat: number;
        lon: number;
    }[];

    destination: string;
    destination_lat: number;
    destination_lon: number;
};
