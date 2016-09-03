import "reflect-metadata";
import * as _ from "lodash";
import {DIModule, dependency, DependencyInfo} from "../di";
import {Constructor, TediError} from "../core";

export abstract class BaseModule {

    private _parentModule: BaseModule;
    private _di: DIModule;

    constructor(parentModule?: BaseModule) {
        this._parentModule = parentModule;
        this._di = new DIModule();
        // initialize
        this.init();
    }

    public getParentModule(): BaseModule {
        return this._parentModule;
    }

    public dependencies(...args: any[]): BaseModule {
        let deps = _.isArray(args) ? args : [];

        deps.forEach((dep: any) => {
            this.setDependency(dep);
        });

        return this;
    }

    public setDependency(dep: any): BaseModule {
        if (_.isUndefined(dep) || _.isNull(dep)) {
            return this;
        }
        if (!(dep instanceof DependencyInfo)) {
            dep = dependency(dep);
        }
        this._di.setDependency(dep);
        return this;
    }

    public setModule(token: any, moduleClass: Constructor<BaseModule>): BaseModule {
        this.setDependency(dependency(token, { value: new moduleClass(this) }));
        return this;
    }

    public getDependency<T>(token: string | Constructor<T>): T {
        let depInstance = this._getBindingRecursively<T>(token);
        if (!depInstance) {
            throw new ModuleError(this, `Could not find dependency "${(token || "?").toString()}" in the module tree`, null);
        }
        return depInstance;
    }

    public snapshot(): BaseModule {
        this._di.snapshot();
        return this;
    }

    public restore(): BaseModule {
        this._di.restore();
        return this;
    }

    public setJsonRoutes(value: any): BaseModule {
        this._di.setDependency(dependency("RoutesDefinition", { value: value}));
        return this;
    }

    public getJsonRoutes(): any {
        return this._di.getDependency<any>("RoutesDefinition");
    }

    protected abstract init(): void;

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

export class ModuleError extends TediError {
    constructor(module: BaseModule, msg: string, error: any) {
        super(`${(<any> module.constructor).name} - ${msg}`, error);
    }
}
