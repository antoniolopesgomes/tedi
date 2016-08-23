import { CustomError } from "../core";
export { inject, injectable } from "inversify";
export declare enum BindingContext {
    SINGLETON = 0,
    TRANSIENT = 1,
    VALUE = 2,
}
export interface BindingOptions {
    context: BindingContext;
}
export declare class DIModuleError extends CustomError {
    constructor(msg: string, error: any);
}
