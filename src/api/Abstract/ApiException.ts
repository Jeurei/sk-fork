export enum ApiErrorCodes {
    Unknown = 1,
};

export class ApiException extends Error {
    code: ApiErrorCodes;

    constructor(code: ApiErrorCodes, message?: string) {
        super(message);
        Object.setPrototypeOf(this, ApiException.prototype);

        this.code = code;
    }
}
