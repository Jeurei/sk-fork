import { TmApiCoords } from './TmApiCoords';
import { TmApiAddressSource } from './TmApiAddressSource';
import { TmApiAddressKind } from './TmApiAddressKind';

export type TmApiGetAddressesLike2Response = {
    addresses: {
        address_source: TmApiAddressSource;
        city: string;
        point: string;
        street: string;
        house: string;
        kind: TmApiAddressKind;
        comment: string;
        coords: TmApiCoords;
    }[];
};
