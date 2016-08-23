import { CustomError } from "../core";
import { BaseErrorHandler } from "./core";
export declare class ErrorHandlerValidatorError extends CustomError {
    constructor(errorHandler: BaseErrorHandler, msg: string, error?: any);
}
export declare class ErrorHandlerValidator {
    static hasValidMetadata(errorHandler: BaseErrorHandler): boolean;
    static implementsErrorHandler(errorHandler: BaseErrorHandler): boolean;
    static validate(errorHandler: BaseErrorHandler): void;
}
