import * as express from 'express';
import {CustomError} from '../extensions';

export class Filter<T> {
    apply(req: express.Request, res: express.Response): any {
        throw new Error('Filter.apply must be implemented.')
    }
    getDataFromRequest(req: express.Request): T {
        throw new Error('Filter.getData must be implemented.')
    }
}

export class FilterError extends CustomError {
    constructor(name: string, err: any) {
        super(`${name}`, err);
    }
}