export {inject, injectable} from 'inversify';

import 'reflect-metadata';
import * as inversify from 'inversify'; 
import {Router, ExpressoRouter, RoutesDefinition} from './router';
import {App} from './app';
import {ExpressApp, ExpressAppBuilder} from './app/express';
import {Config} from './config';
import {ErrorHandler, Filter} from './core';
import {Logger, WinstonLogger} from './logging';
import {Module} from './modules';

let coreKernel = new inversify.Kernel();
let appKernel = new inversify.Kernel();

export enum BindingContext {
    SINGLETON,
    TRANSIENT,
    VALUE
}

interface BindingOptions {
    context: BindingContext
} 

export interface IServerRegistry {

    addController<T>(
        abstraction: string | inversify.INewable<T>, 
        concretion: inversify.INewable<T> | T,
        options?: BindingOptions
    ): IServerRegistry;
    
    addFilter<T>(
        abstraction: string | inversify.INewable<Filter<T>>, 
        concretion: inversify.INewable<Filter<T>> | Filter<T>,
        options?: BindingOptions
    ): IServerRegistry;

    addErrorHandler(
        abstraction: string | inversify.INewable<ErrorHandler>, 
        concretion: inversify.INewable<ErrorHandler> | ErrorHandler,
        options?: BindingOptions
    ): IServerRegistry;

    addComponent<T>(
        abstraction: string | inversify.INewable<T>, 
        concretion: inversify.INewable<T> | T,
        options?: BindingOptions
    ): IServerRegistry;

}

class ServerRegistry implements IServerRegistry {
     
    addController<T>(
        abstraction: string | inversify.INewable<T>, 
        concretion: inversify.INewable<T> | T,
        options?: BindingOptions
    ): ServerRegistry {
        bindToKernel(appKernel, abstraction, concretion, options)
        return this;
    }
    
    addFilter<T>(
        abstraction: string | inversify.INewable<Filter<T>>, 
        concretion: inversify.INewable<Filter<T>> | Filter<T>,
        options?: BindingOptions
    ): ServerRegistry {
        bindToKernel(appKernel, abstraction, concretion, options)
        return this;
    }
    
    addErrorHandler(
        abstraction: string | inversify.INewable<ErrorHandler>, 
        concretion: inversify.INewable<ErrorHandler> | ErrorHandler,
        options?: BindingOptions
    ): ServerRegistry {
        bindToKernel(appKernel, abstraction, concretion, options)
        return this;
    }
    
    addComponent<T>(
        abstraction: string | inversify.INewable<T>, 
        concretion: inversify.INewable<T> | T,
        options?: BindingOptions
    ): ServerRegistry {
        bindToKernel(coreKernel, abstraction, concretion, options)
        return this;
    }

    addModule(
        abstraction: string, 
        module: inversify.INewable<Module> | Module
    ): ServerRegistry {
        bindToKernel(coreKernel, abstraction, module, { context: BindingContext.SINGLETON })
        return this;
    }
    
    controller<T>(abstraction: string | inversify.INewable<T>): T {
        return appKernel.get<T>(abstraction);
    }
    
    filter<T>(abstraction: string | inversify.INewable<Filter<T>>): Filter<T> {
        return appKernel.get<Filter<T>>(abstraction);
    }
    
    errorHandler(abstraction: string | inversify.INewable<ErrorHandler>): ErrorHandler {
        return appKernel.get<ErrorHandler>(abstraction);
    }
    
    component<T>(abstraction: string | inversify.INewable<T>): T {
        return coreKernel.get<T>(abstraction);
    }

    module(abstraction: string): Module {
        return coreKernel.get<Module>(abstraction);
    }
    
    clear(): ServerRegistry {
        coreKernel.unbindAll();
        appKernel.unbindAll();
        return this;
    }
    
    snapshot(): ServerRegistry {
        coreKernel.snapshot();
        appKernel.snapshot();
        return this;
    }
    
    restore(): ServerRegistry {
        coreKernel.restore();
        appKernel.restore();
        return this;
    }
    
    setRoutesJSON(value: any): ServerRegistry {
        bindToKernel(coreKernel, 'RoutesDefinition', value, { context: BindingContext.VALUE });
        return this;
    }


}

function bindToKernel<T>(
    kernel: inversify.IKernel,
    abstraction: string | inversify.INewable<T>, 
    concretion: inversify.INewable<T> | T,
    options: BindingOptions = { context: BindingContext.SINGLETON }
): void {
    switch (options.context) {
        case BindingContext.SINGLETON:
            kernel.bind<T>(abstraction).to(<inversify.INewable<T>>concretion).inSingletonScope();
            break;
        case BindingContext.TRANSIENT:
            kernel.bind<T>(abstraction).to(<inversify.INewable<T>>concretion)
            break;
        case BindingContext.VALUE:
            kernel.bind<T>(abstraction).toConstantValue(<T> concretion);
            break;
        default:
            throwError('Unknown binding context');
            break;
    }   
}

function throwError(msg: string): void {
    throw new Error('Global error: ' + msg);
}

export let Server: ServerRegistry = new ServerRegistry();

//Default bindings
Server
    .addComponent(Logger, WinstonLogger)
    .addComponent(Router, ExpressoRouter)
    .addComponent(ExpressAppBuilder, ExpressAppBuilder)
    .addComponent(App, ExpressApp)
    .addComponent<Config>('Config', <Config> { 
            server: { 
                port: 8080
            } 
        }, 
        { context: BindingContext.VALUE }
    );

