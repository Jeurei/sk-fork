export type TmApiGetAddressesLike2Request = {
    address: string;
    get_houses: boolean;
    get_points: boolean;
    get_streets: boolean;

    city?: string;
    max_addresses_count?: number;
    search_in_tm?: boolean;
    search_in_yandex?: boolean;
    search_in_google?: boolean;
    search_in_2gis?: boolean;
    search_in_tmgeoservice?: boolean;
};
