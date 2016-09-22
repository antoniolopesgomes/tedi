import {ControllerMetadata} from "./controller-metadata";
import {TediError} from "../core";
import {getClassName} from "../core/utils";

export class ControllerValidatorError extends TediError {
    constructor(controller: any, msg: string, error?: any) {
        super(`${getClassName(controller)}: ${msg}`, error);
    }
}

export class ControllerValidator {
    public static validate(controller: any): void {
        // check if it was valid metadata
        if (!ControllerMetadata.getMetadata(controller)) {
            throw new ControllerValidatorError(controller, "must be decorated with @Controller");
        }
    }
}
