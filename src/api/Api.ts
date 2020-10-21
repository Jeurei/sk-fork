import { AbstractTrashApi } from './Abstract/TrashApi';
import { HttpTrashApi } from './Http/TrashApi';

export { TmApiError } from './Http/TrashApi';

type TApi = {
    trash: AbstractTrashApi;
};

export const Api: TApi = {
    trash: new HttpTrashApi(),
};

(window as any).Api = Api;
