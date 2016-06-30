import {Filter} from 'tedi/core';
import * as express from 'express';

export class GeoLocationFilter implements Filter<any> {
    apply(req: express.Request, res: express.Response): any {

    }
    getDataFromRequest(req: express.Request): any {
        
    }
}