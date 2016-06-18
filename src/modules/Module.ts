import 'reflect-metadata';
import * as inversify from 'inversify'; 
import {Router, ExpressoRouter, RoutesDefinition} from '../router';
import {App} from '../app';
import {Config} from '../config';
import {Filter} from '../filters';
import {ErrorHandler} from '../errorHandlers';
import {Logger, WinstonLogger} from '../logging';
import {IModule, BindingContext, BindingOptions} from '../modules';

export class Module implements IModule {
    
    private _kernel: inversify.IKernel;
    private _modules: Map<string, Module>;

    constructor(kernel?: inversify.IKernel) {
        this._kernel = kernel || new inversify.Kernel();
        this._modules = new Map<string, Module>();
    }

    addController<T>(
        abstraction: string | inversify.INewable<T>, 
        concretion: inversify.INewable<T> | T,
        options?: BindingOptions
    ): Module {
        bindToKernel(this._kernel, abstraction, concretion, options)
        return this;
    }
    
    addFilter<T>(
        abstraction: string | inversify.INewable<Filter<T>>, 
        concretion: inversify.INewable<Filter<T>> | Filter<T>,
        options?: BindingOptions
    ): Module {
        bindToKernel(this._kernel, abstraction, concretion, options)
        return this;
    }
    
    addErrorHandler(
        abstraction: string | inversify.INewable<ErrorHandler>, 
        concretion: inversify.INewable<ErrorHandler> | ErrorHandler,
        options?: BindingOptions
    ): Module {
        bindToKernel(this._kernel, abstraction, concretion, options)
        return this;
    }
    
    addComponent<T>(
        abstraction: string | inversify.INewable<T> | Symbol, 
        concretion: inversify.INewable<T> | T,
        options?: BindingOptions
    ): Module {
        bindToKernel(this._kernel, abstraction, concretion, options)
        return this;
    }

    addChildModule(
        name: string, 
        module: inversify.INewable<Module> | Module
    ): Module {
        bindToKernel(this._kernel, name, module, { context: BindingContext.VALUE })
        return this;
    }
    
    controller<T>(abstraction: string | inversify.INewable<T>): T {
        return this._kernel.get<T>(abstraction);
    }
    
    filter<T>(abstraction: string | inversify.INewable<Filter<T>>): Filter<T> {
        return this._kernel.get<Filter<T>>(abstraction);
    }
    
    errorHandler(abstraction: string | inversify.INewable<ErrorHandler>): ErrorHandler {
        return this._kernel.get<ErrorHandler>(abstraction);
    }
    
    component<T>(abstraction: string | inversify.INewable<T> | Symbol): T {
        return this._kernel.get<T>(abstraction);
    }

    childModule(abstraction: string): Module {
        return this._kernel.get<Module>(abstraction);
    }
    
    clear(): Module {
        this._kernel.unbindAll();
        return this;
    }
    
    snapshot(): Module {
        this._kernel.snapshot();
        return this;
    }
    
    restore(): Module {
        this._kernel.restore();
        return this;
    }
    
    setRoutesDefinition(value: any): Module {
        bindToKernel(this._kernel, 'RoutesDefinition', value, { context: BindingContext.VALUE });
        return this;
    }

    getRoutesDefinition(): any {
        return this._kernel.get<any>('RoutesDefinition');
    }

}

function bindToKernel<T>(
    kernel: inversify.IKernel,
    abstraction: string | inversify.INewable<T> | Symbol, 
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