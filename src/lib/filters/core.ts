import * as express from 'express';
import {CustomError} from '../core';

export interface IFilter<T> {
    apply(req: express.Request, res: express.Response): any;
    getDataFromRequest(req: express.Request): T;
}

export class FilterError extends CustomError {
    constructor(name: string, err: any) {
        super(`${name}`, err);
    }
}