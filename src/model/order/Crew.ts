import { Car } from './Car';

export type Crew<NullableCar extends null = never> = {
    car: Car | NullableCar;

    car_id: number;
    code: string;
    common_priority: number;
    crew_group_id: number;
    crew_id: number;
    crew_state_id: number;
    driver_id: number;
    dynamic_priority: number;
    has_label: boolean;
    has_light_house: boolean;
    min_balance: number;
    name: string;
    online: boolean;
    order_change_id: number;
    order_params: number[];
    rating_priority: number;
    static_priority: number;
    use_plan_shifts: boolean;
    work_shift_sum: number;
};
