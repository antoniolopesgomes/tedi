import * as express from "express";
import { BaseFilter } from "../../filter";
export declare class GenericFilter implements BaseFilter<any> {
    private _requestHandler;
    constructor(_requestHandler: express.RequestHandler);
    apply(req: express.Request, res: express.Response): any;
    getDataFromRequest(req: express.Request): any;
}
