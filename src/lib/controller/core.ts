import { TediError } from "../core";
import { getClassName } from "../core/utils";

export class ControllerError extends TediError {
    constructor(target: Object, msg: string, error?: any) {
        super(`${getClassName(target)}": ${msg}`, error);
    }
}

export class ActionError extends TediError {
    constructor(name: string, methodName: string, err: any) {
        super(`${name}#${methodName}`, err);
    }
}
