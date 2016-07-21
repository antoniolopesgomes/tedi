import 'reflect-metadata';
import * as inversify from 'inversify';
import * as _ from 'lodash';
import {BaseFilter, FilterMetadata} from '../filter';
import {ControllerMetadata} from '../controller';
import {BaseErrorHandler, ErrorHandlerMetadata} from '../error-handler';
import {DIModule, BindingContext, BindingOptions, dependency, Dependency} from '../di';
import {Constructor, CustomError} from '../core';

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

    dependencies(...args: any[]): BaseModule {
        let deps = _.isArray(args) ? args: [];

        deps.forEach((dep: any) => {
            this.setDependency(dep);
        });

        return this;
    }

    setDependency(dep: any): BaseModule {
        if (_.isUndefined(dep) || _.isNull(dep)) {
            return this;
        }
        if (!(dep instanceof Dependency)) {
            dep = dependency(dep);
        }
        this._di.setDependency(dep);
        return this;
    }

    setModule(token: any, moduleClass: Constructor<BaseModule>): BaseModule {
        this.setDependency(dependency(token, { value: new moduleClass(this) }))
        return this;
    }

    getDependency<T>(token: string | Constructor<T>): T {
        let depInstance = this._getBindingRecursively<T>(token);
        if (!depInstance) {
            throw new ModuleError(this, `Could not find dependency '${(token || '?').toString()}' in the module tree`, null);
        }
        return depInstance;
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
        this._di.setDependency(dependency('RoutesDefinition', { value: value}));
        return this;
    }

    getJsonRoutes(): any {
        return this._di.getDependency<any>('RoutesDefinition');
    }

    private _getBindingRecursively<T>(abstraction: string | Constructor<T>): T {
        let currentModule: BaseModule = this;
        while (currentModule) {
            if (currentModule._di.hasDependency(abstraction)) {
                return currentModule._di.getDependency<T>(abstraction);
            }
            currentModule = currentModule.getParentModule();
        }
        return null;
    }

}

export class ModuleError extends CustomError {
    constructor(module: BaseModule, msg: string, error: any) {
        super(`${(<any>module.constructor).name} - ${msg}`, error);
    }
}