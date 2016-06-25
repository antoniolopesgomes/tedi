import 'reflect-metadata';
import {ErrorHandler} from '../errors';
import {Filter} from '../filters';
import {Constructor, CustomError} from '../core';

import * as inversify from 'inversify';

export {inject, injectable} from 'inversify';

export enum BindingContext {
    SINGLETON,
    TRANSIENT,
    VALUE
}

export interface BindingOptions {
    context: BindingContext
} 

export interface IModule {

    setController<T>(
        abstraction: string | Constructor<T>, 
        concretion: Constructor<T> | T,
        options?: BindingOptions
    ): IModule;
    
    setFilter<T>(
        abstraction: string | Constructor<Filter<T>>, 
        concretion: Constructor<Filter<T>> | Filter<T>,
        options?: BindingOptions
    ): IModule;

    setErrorHandler(
        abstraction: string | Constructor<ErrorHandler>, 
        concretion: Constructor<ErrorHandler> | ErrorHandler,
        options?: BindingOptions
    ): IModule;

    setComponent<T>(
        abstraction: string | Constructor<T>, 
        concretion: Constructor<T> | T,
        options?: BindingOptions
    ): IModule;
}

export class ModuleError extends CustomError {
    constructor(module: IModule, msg: string, error: any) {
        super(`${(<any>module.constructor).name} - ${msg}`, error);
    }
}