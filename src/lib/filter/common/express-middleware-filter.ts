import * as express from "express";
import * as Promise from "bluebird";
import {BaseFilter, Filter} from "../../filter";

@Filter()
export class ExpressMiddlewareFilter implements BaseFilter<any> {

    constructor(
        private _requestHandler: express.RequestHandler
    ) { }

    public apply(req: express.Request, res: express.Response): any {
        return new Promise((resolve, reject) => {
            this._requestHandler(req, res, (error) => {
                return error ? reject(error) : resolve();
            });
        });
    }

    public getDataFromRequest(req: express.Request): any {
        throw new Error("Filter.getData must be implemented.");
    }

}
