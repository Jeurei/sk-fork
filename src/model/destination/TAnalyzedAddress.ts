import { TAddress } from './TAddress';
import { TCustomizableAddress } from './TCustomizableAddress';
import { TAnalyzedAddressInfo } from './TAnalyzedAddressInfo';

export type TAnalyzedAddress<T = TAddress> = {
    address: TCustomizableAddress;
    info: TAnalyzedAddressInfo;
};
