import {ErrorHandlerMetadata} from "./error-handler-metadata";
import {TediError} from "../core";
import {BaseErrorHandler} from "./core";
import {isFunction} from "lodash";

export class ErrorHandlerValidatorError extends TediError {
    constructor(errorHandler: BaseErrorHandler, msg: string, error?: any) {
        super(`${(<any> errorHandler).constructor.name}: ${msg}`, error);
    }
}

export class ErrorHandlerValidator {

    public static hasValidMetadata(errorHandler: BaseErrorHandler): boolean {
        return ErrorHandlerMetadata.isDecorated(errorHandler.constructor);
    }

    public static implementsErrorHandler(errorHandler: BaseErrorHandler): boolean {
        return isFunction(errorHandler.catch);
    }

    public static validate(errorHandler: BaseErrorHandler): void {
        // check if it implements BaseErrorHandler
        if (!this.implementsErrorHandler(errorHandler)) {
            throw new ErrorHandlerValidatorError(errorHandler, "must implement \"BaseErrorHandler\"");
        }
        // check if it was valid metadata
        if (!this.hasValidMetadata(errorHandler)) {
            throw new ErrorHandlerValidatorError(errorHandler, "must be decorated with @ErrorHandler");
        }
    }
}
