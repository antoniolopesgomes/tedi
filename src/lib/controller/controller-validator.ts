import {ControllerMetadata} from "./controller-metadata";
import {TediError} from "../core";

export class ControllerValidatorError extends TediError {
    constructor(controller: any, msg: string, error?: any) {
        super(`${(<any> controller).constructor.name}: ${msg}`, error);
    }
}

export class ControllerValidator {
    public static hasValidMetadata(controller: any): boolean {
        return ControllerMetadata.isDecoratedWithController(controller.constructor);
    }
    public static validate(controller: any): void {
        // check if it was valid metadata
        if (!this.hasValidMetadata(controller)) {
            throw new ControllerValidatorError(controller, "must be decorated with @Controller");
        }
    }
}
