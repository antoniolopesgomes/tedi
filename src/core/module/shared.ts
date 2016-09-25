import { TediError } from "../errors";
import { getClassName } from "../utils";

export class ModuleError extends TediError {
    constructor(target: Object, msg: string, error?: any) {
        super(`${getClassName(target)}": ${msg}`, error);
    }
}