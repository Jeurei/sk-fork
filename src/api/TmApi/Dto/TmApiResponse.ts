export type TmApiResponse<T> = {
    code: number;
    descr: string;
    data: T;
};
