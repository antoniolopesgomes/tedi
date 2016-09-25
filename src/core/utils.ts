import {Promise} from "../core";
import * as express from "express";

export class ExpressUtils {
    public static runMiddleware(
        middleware: express.RequestHandler,
        req: express.Request, res: express.Response
    ): Promise<any> {
        return new Promise((resolve: Function, reject: Function) => {
            middleware(req, res, (error) => {
                return error ? reject(error) : resolve();
            });
        });
    }
}

// TODO document this stuff!!!
export function getClassName(target: any): string {
    return target.name || target.constructor.name;
}
