import { TAddressKind } from './TAddressKind';
import { TCoords } from './TCoords';
import { TAddressSource } from './TAddressSource';

export type TAddress = {
    address_source: TAddressSource;
    city: string;
    kind: TAddressKind;
    point: string;
    street: string;
    house: string;
    comment: string;
    coords: TCoords;
};
