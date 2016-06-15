import * as express from 'express';
import {CustomError} from './extensions';
import {IModule} from './Server';

export {App} from './app';

export class Filter<T> {
    apply(req: express.Request, res: express.Response): any {
        throw new Error('Filter.apply must be implemented.')
    }
    getData(req: express.Request, res: express.Response): T {
        throw new Error('Filter.getData must be implemented.')
    }
}

export class FilterError extends CustomError {
    constructor(name: string, err: any) {
        super(`${name}`, err);
    }
}

export class ErrorHandler {
    catch(error:any, req: express.Request, res: express.Response): void {
        throw new Error('ErrorHandler.catch must be implemented.')
    }
}

export class ErrorHandlerError extends CustomError {
    constructor(name: string, err: any) {
        super(`${name}`, err);
    }
}

export class ActionError extends CustomError {
    constructor(name: string, methodName: string, err: any) {
        super(`${name}#${methodName}`, err);
    }
}