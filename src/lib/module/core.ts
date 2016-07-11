import 'reflect-metadata';
import {BaseErrorHandler} from '../error-handler';
import {BaseFilter} from '../filter';
import {Constructor, CustomError} from '../core';
import {BindingOptions} from '../di';

export type Abstraction<T> = string | Constructor<T>;
export type Concretion<T> = Constructor<T> | T;

export interface BaseModule {

    setController<T>(
        abstraction: string | Constructor<T>, 
        concretion: Constructor<T> | T,
        options?: BindingOptions
    ): BaseModule;
    
    setFilter<T>(
        abstraction: string | Constructor<BaseFilter<T>>, 
        concretion: Constructor<BaseFilter<T>> | BaseFilter<T>,
        options?: BindingOptions
    ): BaseModule;

    setErrorHandler(
        abstraction: string | Constructor<BaseErrorHandler>, 
        concretion: Constructor<BaseErrorHandler> | BaseErrorHandler,
        options?: BindingOptions
    ): BaseModule;

    setComponent<T>(
        abstraction: string | Constructor<T>, 
        concretion: Constructor<T> | T,
        options?: BindingOptions
    ): BaseModule;
}

export class ModuleError extends CustomError {
    constructor(module: BaseModule, msg: string, error: any) {
        super(`${(<any>module.constructor).name} - ${msg}`, error);
    }
}