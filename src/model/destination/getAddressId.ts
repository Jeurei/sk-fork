import { TAddress } from './TAddress';
import { TCustomizableAddress } from './TCustomizableAddress';

export function getAddressId(address: TAddress | TCustomizableAddress | null, customAreEqual: boolean = true) {
    if (!address) {
        return '';
    }

    if (customAreEqual && (address as TCustomizableAddress).isCustom) {
        return 'custom';
    }

    return `${address.address_source}|${address.city}|${address.kind}|${address.point}|${address.street}|${address.house}|${address.comment}|${address.coords.lat}|${address.coords.lon}`;
}
