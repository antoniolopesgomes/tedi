import * as express from "express";
import { TediError } from "../errors";
import { getClassName } from "../utils";

export interface Filter<T> {
    apply(req: express.Request, res: express.Response): any;
    getDataFromRequest(req: express.Request): T;
}

export class FilterError extends TediError {
    constructor(target: Object, msg: string, error?: any) {
        super(`${getClassName(target)}": ${msg}`, error);
    }
}
