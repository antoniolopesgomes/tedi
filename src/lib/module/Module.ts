import * as inversify from 'inversify';
import {IFilter} from '../filter';
import {IErrorHandler} from '../error-handler';
import {DIModule, BindingContext, BindingOptions} from '../di';
import {Constructor, CustomError} from '../core';
import {IModule, ModuleError} from './core';

export abstract class Module implements IModule {

    private _parentModule: Module;
    private _di: DIModule;

    constructor(parentModule?: Module) {
        this._parentModule = parentModule;
        this._di = new DIModule();
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
        this._di.setBinding(abstraction, concretion, options);
        return this;
    }

    setFilter<T>(
        abstraction: string | Constructor<IFilter<T>>,
        concretion?: Constructor<IFilter<T>> | IFilter<T>,
        options?: BindingOptions
    ): Module {
        this._di.setBinding(abstraction, concretion, options);
        return this;
    }

    setErrorHandler(
        abstraction: string | Constructor<IErrorHandler>,
        concretion?: Constructor<IErrorHandler> | IErrorHandler,
        options?: BindingOptions
    ): Module {
        this._di.setBinding(abstraction, concretion, options);
        return this;
    }

    setComponent<T>(
        abstraction: string | Constructor<T>,
        concretion?: Constructor<T> | T | typeof Object,
        options?: BindingOptions
    ): Module {
        //TODO check for this any casts
        this._di.setBinding(<any>abstraction, concretion, options);
        return this;
    }

    addChildModule(
        name: string,
        ModuleClass: Constructor<Module>
    ): Module {
        this._di.setBinding(name, new ModuleClass(this), { context: BindingContext.VALUE });
        return this;
    }

    controller<T>(abstraction: string | Constructor<T>): T {
        let currentModule: Module = this;
        while (currentModule) {
            if (currentModule._di.hasBinding(abstraction)) {
                return currentModule._di.getBinding<T>(abstraction);
            }
            currentModule = currentModule.getParentModule();
        }
        throw new ModuleError(this, `Could not find controller '${(abstraction || '?').toString()}' in the module tree`, null);
    }

    filter<T>(abstraction: string | Constructor<IFilter<T>>): IFilter<T> {
        let currentModule: Module = this;
        while (currentModule) {
            if (currentModule._di.hasBinding(abstraction)) {
                return currentModule._di.getBinding<IFilter<T>>(abstraction);
            }
            currentModule = currentModule.getParentModule();
        }
        throw new ModuleError(this, `Could not find filter '${(abstraction || '?').toString()}' in the module tree`, null);
    }

    errorHandler(abstraction: string | Constructor<IErrorHandler>): IErrorHandler {
        let currentModule: Module = this;
        while (currentModule) {
            if (currentModule._di.hasBinding(abstraction)) {
                return currentModule._di.getBinding<IErrorHandler>(abstraction);
            }
            currentModule = currentModule.getParentModule();
        }
        throw new ModuleError(this, `Could not find errorHandler '${(abstraction || '?').toString()}' in the module tree`, null);
    }

    component<T>(abstraction: string | Constructor<T>): T {
        let currentModule: Module = this;
        while (currentModule) {
            if (currentModule._di.hasBinding(abstraction)) {
                return currentModule._di.getBinding<T>(abstraction);
            }
            currentModule = currentModule.getParentModule();
        }
        throw new ModuleError(this, `Could not find component '${(abstraction || '?').toString()}' in the module tree`, null);
    }

    childModule(name: string): Module {
        if (!this._di.hasBinding(name)) {
            throw new ModuleError(this, `Could not find module '${(name || '?').toString()}'`, null);
        }
        return this._di.getBinding<Module>(name);
    }

    clear(): Module {
        this._di.unbindAll();
        return this;
    }

    snapshot(): Module {
        this._di.snapshot();
        return this;
    }

    restore(): Module {
        this._di.restore();
        return this;
    }

    setRoutes(value: any): Module {
        this._di.setBinding('RoutesDefinition', value, { context: BindingContext.VALUE });
        return this;
    }

    getRoutes(): any {
        return this._di.getBinding<any>('RoutesDefinition');
    }

}