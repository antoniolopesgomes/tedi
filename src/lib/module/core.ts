import { TediError } from "../core";
import { getClassName } from "../core/utils";

export class ModuleError extends TediError {
    constructor(target: Object, msg: string, error?: any) {
        super(`${getClassName(target)}": ${msg}`, error);
    }
}