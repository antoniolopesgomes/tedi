export * from './Global';

import * as express from 'express';

export class Filter<T> {
    apply(req: express.Request, res: express.Response): void {
        throw new Error('Filter.apply must be implemented.')
    }
    getData(req: express.Request, res: express.Response): T {
        throw new Error('Filter.getData must be implemented.')
    }
}

export class ErrorHandler {
    catch(error:any, req: express.Request, res: express.Response): void {
        throw new Error('ErrorHandler.catch must be implemented.')
    }
}

export interface LoggerCfg {

}

export class Logger {

    private _cfg: LoggerCfg;

    constructor(cfg: LoggerCfg) {
        this._cfg = cfg || <LoggerCfg> { };
    }
}