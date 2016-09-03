import * as express from "express";
import {TediError} from "../core";

export interface BaseFilter<T> {
    apply(req: express.Request, res: express.Response): any;
    getDataFromRequest(req: express.Request): T;
}

export class FilterError extends TediError {
    constructor(name: string, err: any) {
        super(`${name}`, err);
    }
}
