import * as express from "express";
import { TediError } from "../core";
import { getClassName } from "../core/utils";

export interface BaseErrorHandler {
    catch(error: any, req: express.Request, res: express.Response): void;
}

export class ErrorHandlerError extends TediError {
    constructor(target: Object, msg: string, error?: any) {
        super(`${getClassName(target)}": ${msg}`, error);
    }
}
