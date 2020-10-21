export type TmApiAnalyzeRoute2Request = {
    get_full_route_coords: boolean;
    addresses: ({
        address: string;
        lat: number;
        lon: number;
    })[];
};
