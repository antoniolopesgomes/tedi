import { isFunction } from "lodash";
import { BaseErrorHandler, ErrorHandlerError } from "./errors";

const METADATA_KEY = "tedi:errorHandler";

export interface ErrorHandlerMetadata {
    className: string;
}

export class ErrorHandlerHelper {

    setMetadata(target: Object, metadata: ErrorHandlerMetadata): void {
        Reflect.defineMetadata(METADATA_KEY, metadata, target);
    }

    getMetadata(target: Object): ErrorHandlerMetadata {
        return Reflect.getMetadata(METADATA_KEY, target);
    }

    validateInstance(instance: BaseErrorHandler): void {
        // check if it was valid metadata
        if (!this.getMetadata((<Object>instance).constructor)) {
            throw new ErrorHandlerError(instance, "invalid: must be decorated with @ErrorHandler");
        }
        if (!isFunction(instance.catch)) {
            throw new ErrorHandlerError(instance, "invalid: must implement catch method");
        }
    }
}
