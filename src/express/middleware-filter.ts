import * as express from "express";
import * as Promise from "bluebird";

import { Filter } from "../core";
import { Injectable } from "../decorators";

@Injectable()
export class ExpressMiddlewareFilter implements Filter<any> {

    constructor(
        private _requestHandler: express.RequestHandler
    ) { }

    public apply(req: express.Request, res: express.Response): any {
        return runExpressMiddleware(this._requestHandler, req, res);
    }

    public getDataFromRequest(req: express.Request): any {
        throw new Error("Filter.getData must be implemented.");
    }

}

export function runExpressMiddleware(middleware: express.RequestHandler, req: express.Request, res: express.Response): Promise<any> {
    return new Promise((resolve, reject) => {
        try {
            middleware(req, res, (error) => {
                return error ? reject(error) : resolve();
            });
        } catch (error) {
            return reject(error);
        }
    });
}
