import { TediError } from "./tedi-error";
import { getClassName } from "./utils";

export class ActionError extends TediError {
    constructor(instance: any, actionName: string, error?: any) {
        super(`${getClassName(instance)}.${actionName}`, error);
    }
}
