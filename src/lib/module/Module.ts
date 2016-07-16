import 'reflect-metadata';
import * as inversify from 'inversify';
import * as _ from 'lodash';
import {BaseFilter, FilterMetadata} from '../filter';
import {ControllerMetadata} from '../controller';
import {BaseErrorHandler, ErrorHandlerMetadata} from '../error-handler';
import {DIModule, BindingContext, BindingOptions} from '../di';
import {Constructor, CustomError} from '../core';
import {ControllerValidator, FilterValidator, ErrorHandlerValidator, ModuleValidator, ServiceValidator} from './validators';

export abstract class BaseModule {

    private _parentModule: BaseModule;
    private _di: DIModule;

    constructor(parentModule?: BaseModule) {
        this._parentModule = parentModule;
        this._di = new DIModule();
        //initialize
        this.init();
    }

    abstract init(): void;

    getParentModule(): BaseModule {
        return this._parentModule;
    }

    setController<T>(
        abstraction: string | Constructor<T>,
        concretion?: Constructor<T> | T,
        options?: BindingOptions
    ): BaseModule {
        concretion = this._normalizeConcretion<T>(abstraction, concretion);
        options = this._normalizeOptions(options);
        ControllerValidator.validate(concretion, options);
        this._di.setBinding(abstraction, concretion, options);
        return this;
    }

    setFilter<T>(
        abstraction: string | Constructor<BaseFilter<T>>,
        concretion?: Constructor<BaseFilter<T>> | BaseFilter<T>,
        options?: BindingOptions
    ): BaseModule {
        concretion = this._normalizeConcretion<BaseFilter<T>>(abstraction, concretion);
        options = this._normalizeOptions(options);
        FilterValidator.validate(concretion, options);
        this._di.setBinding(abstraction, concretion, options);
        return this;
    }

    setErrorHandler(
        abstraction: string | Constructor<BaseErrorHandler>,
        concretion?: Constructor<BaseErrorHandler> | BaseErrorHandler,
        options?: BindingOptions
    ): BaseModule {
        concretion = this._normalizeConcretion<BaseErrorHandler>(abstraction, concretion);
        options = this._normalizeOptions(options);
        ErrorHandlerValidator.validate(concretion, options);
        this._di.setBinding(abstraction, concretion, options);
        return this;
    }

    setService<T>(
        abstraction: string | Constructor<T>,
        concretion?: Constructor<T> | T,
        options?: BindingOptions
    ): BaseModule {
        //TODO check for this any casts
        concretion = this._normalizeConcretion<T>(abstraction, concretion);
        options = this._normalizeOptions(options);
        //ServiceValidator.validate(concretion, options);
        this._di.setBinding(<any>abstraction, concretion, options);
        return this;
    }

    addChildModule(
        name: string,
        ModuleClass: Constructor<BaseModule>
    ): BaseModule {
        let concretion: BaseModule = new ModuleClass(this);
        let options: BindingOptions = { context: BindingContext.VALUE }
        ModuleValidator.validate(concretion, options);
        this._di.setBinding(name, concretion, options);
        return this;
    }

    controller<T>(abstraction: string | Constructor<T>): T {
        let controller = this._getBindingRecursively<T>(abstraction);
        if (!controller) {
            throw new ModuleError(this, `Could not find controller '${(abstraction || '?').toString()}' in the module tree`, null);
        }
        return controller;
    }

    filter<T>(abstraction: string | Constructor<BaseFilter<T>>): BaseFilter<T> {
        let filter = this._getBindingRecursively<BaseFilter<T>>(abstraction);
        if (!filter) {
            throw new ModuleError(this, `Could not find filter '${(abstraction || '?').toString()}' in the module tree`, null);
        }
        return filter;
    }

    errorHandler(abstraction: string | Constructor<BaseErrorHandler>): BaseErrorHandler {
        let errorHandler = this._getBindingRecursively<BaseErrorHandler>(abstraction);
        if (!errorHandler) {
            throw new ModuleError(this, `Could not find errorHandler '${(abstraction || '?').toString()}' in the module tree`, null);
        }
        return errorHandler;
    }

    component<T>(abstraction: string | Constructor<T>): T {
        let component = this._getBindingRecursively<T>(abstraction);
        if (!component) {
            throw new ModuleError(this, `Could not find component '${(abstraction || '?').toString()}' in the module tree`, null);
        }
        return component;
    }

    childModule(name: string): BaseModule {
        if (!this._di.hasBinding(name)) {
            throw new ModuleError(this, `Could not find module '${(name || '?').toString()}'`, null);
        }
        return this._di.getBinding<BaseModule>(name);
    }

    clear(): BaseModule {
        this._di.unbindAll();
        return this;
    }

    snapshot(): BaseModule {
        this._di.snapshot();
        return this;
    }

    restore(): BaseModule {
        this._di.restore();
        return this;
    }

    setJsonRoutes(value: any): BaseModule {
        this._di.setBinding('RoutesDefinition', value, { context: BindingContext.VALUE });
        return this;
    }

    getJsonRoutes(): any {
        return this._di.getBinding<any>('RoutesDefinition');
    }

    private _getBindingRecursively<T>(abstraction: string | Constructor<T>): T {
        let currentModule: BaseModule = this;
        while (currentModule) {
            if (currentModule._di.hasBinding(abstraction)) {
                return currentModule._di.getBinding<T>(abstraction);
            }
            currentModule = currentModule.getParentModule();
        }
        return null;
    }

    private _normalizeConcretion<T>(
        abstraction: string | Constructor<T>,
        concretion: Constructor<T> | T
    ): Constructor<T> | T {
        /*
            If no concretion was defined assume that this abstraction binding is a class 
            and register it as the concretion.
        */
        return concretion ?
            concretion :
            <Constructor<T>>abstraction;
    }

    private _normalizeOptions(options: BindingOptions): BindingOptions {
        options = options || <BindingOptions> {};
        options.context = _.isUndefined(options.context) ? BindingContext.SINGLETON : options.context;
        return options;
    }

}

export class ModuleError extends CustomError {
    constructor(module: BaseModule, msg: string, error: any) {
        super(`${(<any>module.constructor).name} - ${msg}`, error);
    }
}