import { TCoords } from '../destination/TCoords';
import { TAnalyzedAddress } from './TAnalyzedAddress';
import { TAddress } from './TAddress';

export type TRoute<T = TAddress> = {
    addresses: TAnalyzedAddress<T>[];
    city_dist: number;
    country_dist: number;
    source_country_dist: number;
    full_route_coords: TCoords[];
};
