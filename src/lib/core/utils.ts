import {Promise} from '../core';
import * as express from 'express';

export class ExpressUtils {
    static runMiddleware(
        middleware: express.RequestHandler,
        req: express.Request, res: express.Response
    ): Promise<any> {
        return new Promise((resolve: Function, reject: Function) => {
            middleware(req, res, (error) => {
                return error ? reject(error) : resolve();
            });
        })
    }
}

//export function is