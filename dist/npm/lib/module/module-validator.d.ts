import { CustomError } from "../core";
import { BindingOptions } from "../di";
export declare class ModuleValidatorError extends CustomError {
    constructor(msg: string, error?: any);
}
export declare class ModuleValidator {
    static isValid(target: Object, options: BindingOptions): boolean;
    static validate(target: Object, options: BindingOptions): void;
}
