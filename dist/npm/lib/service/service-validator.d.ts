import { CustomError } from "../core";
import { BindingOptions } from "../di";
export declare class ServiceValidatorError extends CustomError {
    constructor(msg: string, error?: any);
}
export declare class ServiceValidator {
    static isValid(target: Object, options: BindingOptions): boolean;
    static validate(target: Object, options: BindingOptions): void;
}
