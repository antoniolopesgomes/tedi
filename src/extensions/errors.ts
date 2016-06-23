import {Constructor} from './core';

export const NestedError: Constructor<Object> = require('nested-error-stacks');

export class CustomError extends NestedError {

    constructor(msg: string, error: any) {
        super(msg, error);
        (<any>this).name = this.constructor.name;
    }

}