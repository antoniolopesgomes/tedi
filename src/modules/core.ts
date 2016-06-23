import {
    ErrorHandler,
    Filter,
} from '../core';

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
        abstraction: string | inversify.INewable<T>, 
        concretion: inversify.INewable<T> | T,
        options?: BindingOptions
    ): IModule;
    
    setFilter<T>(
        abstraction: string | inversify.INewable<Filter<T>>, 
        concretion: inversify.INewable<Filter<T>> | Filter<T>,
        options?: BindingOptions
    ): IModule;

    setErrorHandler(
        abstraction: string | inversify.INewable<ErrorHandler>, 
        concretion: inversify.INewable<ErrorHandler> | ErrorHandler,
        options?: BindingOptions
    ): IModule;

    setComponent<T>(
        abstraction: string | inversify.INewable<T>, 
        concretion: inversify.INewable<T> | T,
        options?: BindingOptions
    ): IModule;
}