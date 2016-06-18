import {CustomError} from '../extensions';

export class ActionError extends CustomError {
    constructor(name: string, methodName: string, err: any) {
        super(`${name}#${methodName}`, err);
    }
}