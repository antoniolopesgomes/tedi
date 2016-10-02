import { isFunction } from "lodash";
import * as express from "express";
import { TediError } from "./tedi-error";
import { getClassName } from "./utils";

export interface ErrorHandler {
    catch(error: any, req: express.Request, res: express.Response): void;
}

export function validateErrorHandler(instance: ErrorHandler): void {
    if (!isFunction(instance.catch)) {
        throw new ErrorHandlerError(instance, "invalid: must implement catch method");
    }
}

export class ErrorHandlerError extends TediError {
    constructor(target: Object, msg: string, error?: any) {
        super(`${getClassName(target)}": ${msg}`, error);
    }
}
