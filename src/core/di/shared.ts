import {TediError} from "../errors";

export class DIModuleError extends TediError {
    constructor(msg: string, error: any) {
        super(`${msg}`, error);
    }
}
