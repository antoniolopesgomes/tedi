import {TediError} from "../core";

export class ActionError extends TediError {
    constructor(name: string, methodName: string, err: any) {
        super(`${name}#${methodName}`, err);
    }
}
