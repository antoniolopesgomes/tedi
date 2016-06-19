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
import { CustomError } from '../extensions';

export abstract class Module implements IModule {

    private _parentModule: Module;
    private _kernel: inversify.IKernel;
    private _modules: Map<string, Module>;

    constructor(parentModule?: Module) {
        this._parentModule = parentModule;
        this._kernel = new inversify.Kernel();
        this._modules = new Map<string, Module>();
        //initialize
        this.init();
    }

    abstract init(): void;

    get parentModule(): Module {
        return this._parentModule;
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
        concretion: inversify.INewable<T> | T | typeof Object,
        options?: BindingOptions
    ): Module {
        //TODO check for this any casts
        setBinding(this._kernel, <any>abstraction, concretion, options);
        return this;
    }

    addChildModule(
        name: string,
        ModuleClass: inversify.INewable<Module>
    ): Module {
        setBinding(this._kernel, name, new ModuleClass(this), { context: BindingContext.VALUE });
        return this;
    }

    controller<T>(abstraction: string | inversify.INewable<T>): T {
        let currentModule: Module = this;
        while (currentModule) {
            if (hasBinding(currentModule._kernel, abstraction)) {
                return getBinding<T>(currentModule._kernel, abstraction);
            }
            currentModule = currentModule.parentModule;
        }
        throw new ModuleError(`Could not find controller '${(abstraction || '?').toString()}' in the module tree`, null);
    }

    filter<T>(abstraction: string | inversify.INewable<Filter<T>>): Filter<T> {
        let currentModule: Module = this;
        while (currentModule) {
            if (hasBinding(currentModule._kernel, abstraction)) {
                return getBinding<Filter<T>>(currentModule._kernel, abstraction);
            }
            currentModule = currentModule.parentModule;
        }
        throw new ModuleError(`Could not find filter '${(abstraction || '?').toString()}' in the module tree`, null);
    }

    errorHandler(abstraction: string | inversify.INewable<ErrorHandler>): ErrorHandler {
        let currentModule: Module = this;
        while (currentModule) {
            if (hasBinding(currentModule._kernel, abstraction)) {
                return getBinding<ErrorHandler>(currentModule._kernel, abstraction);
            }
            currentModule = currentModule.parentModule;
        }
        throw new ModuleError(`Could not find errorHandler '${(abstraction || '?').toString()}' in the module tree`, null);
    }

    component<T>(abstraction: string | Function | Symbol): T {
        let currentModule: Module = this;
        while (currentModule) {
            if (hasBinding(currentModule._kernel, abstraction)) {
                return getBinding<T>(currentModule._kernel, abstraction);
            }
            currentModule = currentModule.parentModule;
        }
        throw new ModuleError(`Could not find component '${(abstraction || '?').toString()}' in the module tree`, null);
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

function getBinding<T>(
    kernel: inversify.IKernel,
    abstraction: string | inversify.INewable<any> | Symbol | Function
): T {
    return kernel.get<T>(<any> abstraction);
}

//TODO hack to check if a binding is registered in the kernel. Update to inversify RC when it's released
function hasBinding(
    kernel: inversify.IKernel,
    abstraction: string | inversify.INewable<any> | Symbol | Function
): boolean {
    let kernelLookup = (<any> kernel)._bindingDictionary;
    return kernelLookup.hasKey(abstraction);
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
            throw new ModuleError('Unknown binding context', null);
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

export class ModuleError extends CustomError {
    constructor(msg: string, error: any) {
        super(msg, error);
    }
}