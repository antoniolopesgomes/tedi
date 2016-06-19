import 'reflect-metadata';
import * as inversify from 'inversify';
import {
    ErrorHandler,
    Filter,
} from '../core';
import {
    IModule,
    BindingOptions,
    BindingContext
} from './core';

export class Module implements IModule {

    private _kernel: inversify.IKernel;
    private _modules: Map<string, Module>;

    constructor(kernel?: inversify.IKernel) {
        this._kernel = kernel || new inversify.Kernel();
        this._modules = new Map<string, Module>();
    }

    setController<T>(
        abstraction: string | inversify.INewable<T>,
        concretion: inversify.INewable<T> | T,
        options?: BindingOptions
    ): Module {
        setBinding(this._kernel, abstraction, concretion, options);
        return this;
    }

    setFilter<T>(
        abstraction: string | inversify.INewable<Filter<T>>,
        concretion: inversify.INewable<Filter<T>> | Filter<T>,
        options?: BindingOptions
    ): Module {
        setBinding(this._kernel, abstraction, concretion, options);
        return this;
    }

    setErrorHandler(
        abstraction: string | inversify.INewable<ErrorHandler>,
        concretion: inversify.INewable<ErrorHandler> | ErrorHandler,
        options?: BindingOptions
    ): Module {
        setBinding(this._kernel, abstraction, concretion, options);
        return this;
    }

    setComponent<T>(
        abstraction: string | Function | Symbol,
        concretion: inversify.INewable<T> | T,
        options?: BindingOptions
    ): Module {
        //TODO check for this any casts
        setBinding(this._kernel, <any>abstraction, concretion, options);
        return this;
    }

    addChildModule(
        name: string,
        module: inversify.INewable<Module> | Module
    ): Module {
        setBinding(this._kernel, name, module, { context: BindingContext.VALUE });
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

    component<T>(abstraction: string | Function | Symbol): T {
        return this._kernel.get<T>(<any>abstraction);
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
        setBinding(this._kernel, 'RoutesDefinition', value, { context: BindingContext.VALUE });        
        return this;
    }

    getRoutesDefinition(): any {
        return this._kernel.get<any>('RoutesDefinition');
    }

}

function hasBinding(
    kernel: inversify.IKernel,
    abstraction: string | inversify.INewable<any> | Symbol
): boolean {
    try {
        kernel.get(abstraction);
        return true;
    }
    catch (error) {
        return false;
    }
}

function unbindFromKernel(
    kernel: inversify.IKernel,
    abstraction: string | inversify.INewable<any> | Symbol
): void {
    kernel.unbind(abstraction);
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
            kernel.bind<T>(abstraction).toConstantValue(<T>concretion);
            break;
        default:
            throwError('Unknown binding context');
            break;
    }
}

function setBinding<T>(
    kernel: inversify.IKernel,
    abstraction: string | inversify.INewable<T>,
    concretion: inversify.INewable<T> | T,
    options?: BindingOptions
): void {
    if (hasBinding(kernel, abstraction)) {
        unbindFromKernel(kernel, abstraction);
    }
    bindToKernel(kernel, abstraction, concretion, options)
}

function throwError(msg: string): void {
    throw new Error('Global error: ' + msg);
}