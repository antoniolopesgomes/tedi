import * as inversify from 'inversify';
import {IFilter} from '../filters';
import {IErrorHandler} from '../errors';
import {Constructor, CustomError} from '../core';
import {
    IModule,
    ModuleError,
    BindingOptions,
    BindingContext
} from './core';

export abstract class Module implements IModule {

    private _parentModule: Module;
    private _kernel: inversify.interfaces.Kernel;

    constructor(parentModule?: Module) {
        this._parentModule = parentModule;
        this._kernel = new inversify.Kernel();
        //initialize
        this.init();
    }

    abstract init(): void;

    getParentModule(): Module {
        return this._parentModule;
    }

    setController<T>(
        abstraction: string | Constructor<T>,
        concretion?: Constructor<T> | T,
        options?: BindingOptions
    ): Module {
        setBinding(this._kernel, abstraction, concretion, options);
        return this;
    }

    setFilter<T>(
        abstraction: string | Constructor<IFilter<T>>,
        concretion?: Constructor<IFilter<T>> | IFilter<T>,
        options?: BindingOptions
    ): Module {
        setBinding(this._kernel, abstraction, concretion, options);
        return this;
    }

    setErrorHandler(
        abstraction: string | Constructor<IErrorHandler>,
        concretion?: Constructor<IErrorHandler> | IErrorHandler,
        options?: BindingOptions
    ): Module {
        setBinding(this._kernel, abstraction, concretion, options);
        return this;
    }

    setComponent<T>(
        abstraction: string | Constructor<T>,
        concretion?: Constructor<T> | T | typeof Object,
        options?: BindingOptions
    ): Module {
        //TODO check for this any casts
        setBinding(this._kernel, <any>abstraction, concretion, options);
        return this;
    }

    addChildModule(
        name: string,
        ModuleClass: Constructor<Module>
    ): Module {
        setBinding(this._kernel, name, new ModuleClass(this), { context: BindingContext.VALUE });
        return this;
    }

    controller<T>(abstraction: string | Constructor<T>): T {
        let currentModule: Module = this;
        while (currentModule) {
            if (hasBinding(currentModule._kernel, abstraction)) {
                return getBinding<T>(currentModule._kernel, abstraction);
            }
            currentModule = currentModule.getParentModule();
        }
        throw new ModuleError(this, `Could not find controller '${(abstraction || '?').toString()}' in the module tree`, null);
    }

    filter<T>(abstraction: string | Constructor<IFilter<T>>): IFilter<T> {
        let currentModule: Module = this;
        while (currentModule) {
            if (hasBinding(currentModule._kernel, abstraction)) {
                return getBinding<IFilter<T>>(currentModule._kernel, abstraction);
            }
            currentModule = currentModule.getParentModule();
        }
        throw new ModuleError(this, `Could not find filter '${(abstraction || '?').toString()}' in the module tree`, null);
    }

    errorHandler(abstraction: string | Constructor<IErrorHandler>): IErrorHandler {
        let currentModule: Module = this;
        while (currentModule) {
            if (hasBinding(currentModule._kernel, abstraction)) {
                return getBinding<IErrorHandler>(currentModule._kernel, abstraction);
            }
            currentModule = currentModule.getParentModule();
        }
        throw new ModuleError(this, `Could not find errorHandler '${(abstraction || '?').toString()}' in the module tree`, null);
    }

    component<T>(abstraction: string | Constructor<T>): T {
        let currentModule: Module = this;
        while (currentModule) {
            if (hasBinding(currentModule._kernel, abstraction)) {
                return getBinding<T>(currentModule._kernel, abstraction);
            }
            currentModule = currentModule.getParentModule();
        }
        throw new ModuleError(this, `Could not find component '${(abstraction || '?').toString()}' in the module tree`, null);
    }

    childModule(name: string): Module {
        if (!hasBinding(this._kernel, name)) {
            throw new ModuleError(this, `Could not find module '${(name || '?').toString()}'`, null);
        }
        return this._kernel.get<Module>(name);
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

    setRoutes(value: any): Module {
        setBinding(this._kernel, 'RoutesDefinition', value, { context: BindingContext.VALUE });
        return this;
    }

    getRoutes(): any {
        return this._kernel.get<any>('RoutesDefinition');
    }

}

function getBinding<T>(
    kernel: inversify.interfaces.Kernel,
    abstraction: string | Constructor<T>
): T {
    return kernel.get<T>(<any>abstraction);
}

function hasBinding(
    kernel: inversify.interfaces.Kernel,
    abstraction: string | Constructor<any>
): boolean {
    return kernel.isBound(abstraction);
}

function unbindFromKernel(
    kernel: inversify.interfaces.Kernel,
    abstraction: string | Constructor<any>
): void {
    kernel.unbind(abstraction);
}

function bindToKernel<T>(
    kernel: inversify.interfaces.Kernel,
    abstraction: string | Constructor<T>,
    concretion: Constructor<T> | T,
    options: BindingOptions = { context: BindingContext.SINGLETON }
): void {
    switch (options.context) {
        case BindingContext.SINGLETON:
            kernel.bind<T>(abstraction).to(<Constructor<T>>concretion).inSingletonScope();
            break;
        case BindingContext.TRANSIENT:
            kernel.bind<T>(abstraction).to(<Constructor<T>>concretion)
            break;
        case BindingContext.VALUE:
            kernel.bind<T>(abstraction).toConstantValue(<T>concretion);
            break;
        default:
            throw new ModuleError(this, 'Unknown binding context', null);
    }
}

function setBinding<T>(
    kernel: inversify.interfaces.Kernel,
    abstraction: string | Constructor<T>,
    concretion: Constructor<T> | T,
    options?: BindingOptions
): void {
    //if no concretion was defined assume that this abstraction binding is a class and register it as the concretion
    if (!concretion) {
        concretion = <Constructor<T>> abstraction;
    }
    if (hasBinding(kernel, abstraction)) {
        unbindFromKernel(kernel, abstraction);
    }
    bindToKernel(kernel, abstraction, concretion, options)
}