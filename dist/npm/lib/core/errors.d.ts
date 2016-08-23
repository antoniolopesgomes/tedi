import { Constructor } from "./interfaces";
export declare const NestedError: Constructor<Object>;
export declare class CustomError extends NestedError {
    constructor(msg: string, error: any);
    getRootCause(): any;
}
