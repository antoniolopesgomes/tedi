import * as express from 'express';
import {CustomError} from '../extensions';

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