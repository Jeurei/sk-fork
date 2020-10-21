import { TAddress } from './TAddress';
import { TCustomizableAddress } from './TCustomizableAddress';

let nextDestinationId = 1;

export function alterDestinationId(destination: TIncompleteDestination) {
    if (!destination.id) {
        destination.id = nextDestinationId++;
    }
    return destination;
}

export function alterDestinationIds(destinations: TIncompleteDestination[]): TIncompleteDestination[] {
    destinations.forEach(alterDestinationId)
    return destinations;
}

export type TIncompleteDestination = {
    id?: number;
    address: TCustomizableAddress | null;
    dropoff: string;
};

export type TDestination = {
    address: TAddress;
    dropoff: string;
};
