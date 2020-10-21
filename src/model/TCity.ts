export type TCity = {
    name: string;
    district: string;
    crewGroupId: number;
    timezone: number;
    minPrice?: number;
    boundaries: [[number, number], [number, number]];
};
