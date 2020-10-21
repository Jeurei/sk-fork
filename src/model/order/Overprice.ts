export type Overprice = {
    id: number;
    name: string;
    description?: string;
    value: number;
    include?: OverpriceFilter[];
    exclude?: OverpriceFilter[];
};

export type OverpriceFilter = {
    city?: string;
    district?: string;
};
