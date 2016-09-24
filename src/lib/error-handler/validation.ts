import { BaseErrorHandler, ErrorHandlerError } from "./core";
import { isFunction } from "lodash";
import { getMetadata } from "./decorator";

export function validateInstance(instance: BaseErrorHandler): void {
    // check if it was valid metadata
    if (!getMetadata((<Object> instance).constructor)) {
        throw new ErrorHandlerError(instance, "invalid: must be decorated with @ErrorHandler");
    }
    if (!isFunction(instance.catch)) {
        throw new ErrorHandlerError(instance, "invalid: must implement catch method");
    }
}
