import {CustomError} from '../core';

export {inject, injectable} from 'inversify';

export enum BindingContext {
    SINGLETON,
    TRANSIENT,
    VALUE
}

export interface BindingOptions {
    context: BindingContext
}

export class DIModuleError extends CustomError {
    constructor(msg: string, error: any) {
        super(`${msg}`, error);
    }
}