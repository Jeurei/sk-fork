import { TmApiCoords } from './TmApiCoords';

export type TmApiAnalyzeRoute2Response = {
    addresses: {
        lat: number;
        lon: number;
        zone_id: number;
        parking_id: number;
    }[];
    city_dist: number;
    country_dist: number;
    source_country_dist: number;
    full_route_coords: TmApiCoords[];
};
