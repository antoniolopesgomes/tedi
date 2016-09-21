import {ControllerMetadataManager} from "./controller-metadata";
import {TediError} from "../core";

export class ControllerValidatorError extends TediError {
    constructor(controller: any, msg: string, error?: any) {
        super(`${(<any> controller).constructor.name}: ${msg}`, error);
    }
}

export class ControllerValidator {
    public static validate(target: any): void {
        // check if it was valid metadata
        if (!ControllerMetadataManager.getControllerMetadata(target)) {
            throw new ControllerValidatorError(target, "must be decorated with @Controller");
        }
    }
}
