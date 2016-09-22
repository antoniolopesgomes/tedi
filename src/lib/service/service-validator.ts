import {ServiceMetadata} from "./service-metadata";
import {TediError} from "../core";
import {getClassName} from "../core/utils";

export class ServiceValidatorError extends TediError {
    constructor(service: any, msg: string, error?: any) {
        super(`${getClassName(service)}: ${msg}`, error);
    }
}

export class ServiceValidator {
    public static validate(service: Object): void {
        // check if it was valid metadata
        if (!ServiceMetadata.getMetadata(service)) {
            throw new ServiceValidatorError(service, "must be decorated with @Service");
        }
    }
}
