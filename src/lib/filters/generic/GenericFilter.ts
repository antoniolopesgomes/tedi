
import * as express from 'express';
import * as Promise from 'bluebird';
import {IFilter} from '../../filters';

export class GenericFilter implements IFilter<any> {

    constructor(
        private _requestHandler: express.RequestHandler
    ) {
    }

    apply(req: express.Request, res: express.Response): any {
        return new Promise((resolve, reject) => {
            this._requestHandler(req, res, (error) => {
                return error ? reject(error) : resolve();
            });
        });
    }

    getDataFromRequest(req: express.Request): any {
        throw new Error('Filter.getData must be implemented.')
    }

}