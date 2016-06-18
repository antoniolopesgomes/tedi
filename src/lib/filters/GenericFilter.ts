
import * as express from 'express';
import {Filter} from '../filters';
import * as Promise from 'bluebird';

export class GenericFilter extends Filter<any> {

    constructor(
        private _requestHandler: express.RequestHandler
    ) {
        super();
    }

    apply(req: express.Request, res: express.Response): any {
        return new Promise((resolve, reject) => {
            this._requestHandler(req, res, (error) => {
                return error ? reject(error) : resolve();
            });
        });
    }

    getData(req: express.Request, res: express.Response): any {
        throw new Error('Filter.getData must be implemented.')
    }

}