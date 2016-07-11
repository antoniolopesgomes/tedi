import * as express from 'express';
import {CustomError} from '../core';

export interface BaseErrorHandler {
    catch(error:any, req: express.Request, res: express.Response): void;
}

export class ErrorHandlerError extends CustomError {
    constructor(name: string, err: any) {
        super(`${name}`, err);
    }
}