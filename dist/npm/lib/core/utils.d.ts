/// <reference types="es6-promise" />
import * as express from "express";
export declare class ExpressUtils {
    static runMiddleware(middleware: express.RequestHandler, req: express.Request, res: express.Response): Promise<any>;
}
