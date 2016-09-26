import * as inversify from "inversify";
import {TediError} from "../errors";

export type DIToken = string | symbol | inversify.interfaces.Newable<any>;

export class DIModuleError extends TediError {
    constructor(msg: string, error: any) {
        super(`${msg}`, error);
    }
}
