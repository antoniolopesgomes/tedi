import { CustomError } from "../core";
import { BindingOptions } from "../di";
export declare class DependencyValidatorError extends CustomError {
    constructor(msg: string, error?: any);
}
export declare class DependencyValidator {
    static isDecorated(target: Object, options: BindingOptions): boolean;
    static validate(target: Object, options: BindingOptions): void;
}
