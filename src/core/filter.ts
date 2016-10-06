import { isFunction } from "lodash";
import * as express from "express";
import { TediError } from "./tedi-error";
import { getClassName } from "./utils";

export interface Filter<T> {
    apply(req: express.Request, res: express.Response): any;
    getDataFromRequest(req: express.Request): T;
}

export function validateFilter(instance: Filter<any>): void {
    if (!isFunction(instance.apply) || !isFunction(instance.getDataFromRequest)) {
        throw new FilterError(instance, "invalid Filter instance");
    }
}

export class FilterError extends TediError {
    constructor(target: Object, error?: any) {
        super(`${getClassName(target)}`, error);
    }
}
