import * as express from "express";
import { CustomError } from "../core";
export interface BaseFilter<T> {
    apply(req: express.Request, res: express.Response): any;
    getDataFromRequest(req: express.Request): T;
}
export declare class FilterError extends CustomError {
    constructor(name: string, err: any);
}
