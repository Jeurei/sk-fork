import { TAddress } from './TAddress';
import { TCity } from '../TCity';

export type TCustomizableAddress = TAddress &
    (
        | {
              isCustom: true;
              citymeta: null;
          }
        | {
              isCustom: false;
              citymeta: TCity;
          }
    );
