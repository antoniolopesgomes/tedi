export {inject, injectable} from 'inversify';

import 'reflect-metadata';
import * as inversify from 'inversify';
import {Router, CoreRouter} from './router';
import {App, ExpressApp} from './app';
import {Config} from './config';
import {ErrorHandler, Filter} from './index';

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

class GlobalRegister {
     
    registerController<T>(
        abstraction: string | inversify.INewable<T>, 
        concretion: inversify.INewable<T> | T,
        options?: BindingOptions
    ): GlobalRegister {
        bindToKernel(appKernel, abstraction, concretion, options)
        return this;
    }
    
    registerFilter<T>(
        abstraction: string | inversify.INewable<Filter<T>>, 
        concretion: inversify.INewable<Filter<T>> | Filter<T>,
        options?: BindingOptions
    ): GlobalRegister {
        bindToKernel(appKernel, abstraction, concretion, options)
        return this;
    }
    
    registerErrorHandler(
        abstraction: string | inversify.INewable<ErrorHandler>, 
        concretion: inversify.INewable<ErrorHandler> | ErrorHandler,
        options?: BindingOptions
    ): GlobalRegister {
        bindToKernel(appKernel, abstraction, concretion, options)
        return this;
    }
    
    registerCoreComponent<T>(
        abstraction: string | inversify.INewable<T>, 
        concretion: inversify.INewable<T> | T,
        options?: BindingOptions
    ): GlobalRegister {
        bindToKernel(coreKernel, abstraction, concretion, options)
        return this;
    }
    
    getController<T>(abstraction: string | inversify.INewable<T>): T {
        return appKernel.get<T>(abstraction);
    }
    
    getFilter<T>(abstraction: string | inversify.INewable<Filter<T>>): Filter<T> {
        return appKernel.get<Filter<T>>(abstraction);
    }
    
    getErrorHandler(abstraction: string | inversify.INewable<ErrorHandler>): ErrorHandler {
        return appKernel.get<ErrorHandler>(abstraction);
    }
    
    getCoreComponent<T>(abstraction: string | inversify.INewable<T>): T {
        return coreKernel.get<T>(abstraction);
    }
    
    clear(): GlobalRegister {
        coreKernel.unbindAll();
        appKernel.unbindAll();
        return this;
    }
    
    snapshot(): GlobalRegister {
        coreKernel.snapshot();
        appKernel.snapshot();
        return this;
    }
    
    restore(): GlobalRegister {
        coreKernel.restore();
        appKernel.restore();
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

export let Global: GlobalRegister = new GlobalRegister();

//Default bindings
Global
    .registerCoreComponent<Router>('Router', CoreRouter)
    .registerCoreComponent<App>('App', ExpressApp)
    .registerCoreComponent<Config>(
        'Config', 
        <Config> { 
            server: { 
                port: 8080
            } 
        }, 
        { context: BindingContext.VALUE }
    );

