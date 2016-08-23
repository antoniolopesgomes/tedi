import { CustomError } from "../core";
import { BaseFilter } from "./core";
export declare class FilterValidatorError extends CustomError {
    constructor(filter: BaseFilter<any>, msg: string, error?: any);
}
export declare class FilterValidator {
    static hasValidMetadata(filter: BaseFilter<any>): boolean;
    static implementsFilter(filter: BaseFilter<any>): boolean;
    static validate(filter: BaseFilter<any>): void;
}
