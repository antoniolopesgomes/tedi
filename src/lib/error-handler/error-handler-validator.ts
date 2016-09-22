import {isFunction} from "lodash";
import {ErrorHandlerMetadata} from "./error-handler-metadata";
import {TediError} from "../core";
import {getClassName} from "../core/utils";
import {BaseErrorHandler} from "./core";

export class ErrorHandlerValidatorError extends TediError {
    constructor(errorHandler: BaseErrorHandler, msg: string, error?: any) {
        super(`${getClassName(errorHandler)}: ${msg}`, error);
    }
}

export class ErrorHandlerValidator {

    public static implementsErrorHandler(errorHandler: BaseErrorHandler): boolean {
        return isFunction(errorHandler.catch);
    }

    public static validate(errorHandler: BaseErrorHandler): void {
        // check if it implements BaseFilter
        if (!this.implementsErrorHandler(errorHandler)) {
            throw new ErrorHandlerValidatorError(errorHandler, "must implement 'BaseErrorHandler'");
        }
        // check if it was valid metadata
        if (!ErrorHandlerMetadata.getMetadata(errorHandler)) {
            throw new ErrorHandlerValidatorError(errorHandler, "must be decorated with @ErrorHandler");
        }
    }
}
