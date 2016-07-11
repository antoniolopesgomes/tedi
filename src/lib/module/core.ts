import 'reflect-metadata';
import {IErrorHandler} from '../error-handler';
import {IFilter} from '../filter';
import {Constructor, CustomError} from '../core';
import {BindingOptions} from '../di';

export interface IModule {

    setController<T>(
        abstraction: string | Constructor<T>, 
        concretion: Constructor<T> | T,
        options?: BindingOptions
    ): IModule;
    
    setFilter<T>(
        abstraction: string | Constructor<IFilter<T>>, 
        concretion: Constructor<IFilter<T>> | IFilter<T>,
        options?: BindingOptions
    ): IModule;

    setErrorHandler(
        abstraction: string | Constructor<IErrorHandler>, 
        concretion: Constructor<IErrorHandler> | IErrorHandler,
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