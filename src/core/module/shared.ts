import "reflect-metadata";
import * as _ from "lodash";
import { DIModule, dependency, DependencyInfo } from "../di";
import { Constructor } from "../interfaces";
import { TediError } from "../errors";
import { getClassName } from "../utils";

export class ModuleError extends TediError {
    constructor(target: Object, msg: string, error?: any) {
        super(`${getClassName(target)}": ${msg}`, error);
    }
}

export abstract class BaseModule {

    private _parentModule: BaseModule;
    private _di: DIModule;

    constructor(parentModule?: BaseModule) {
        this._parentModule = parentModule;
        if (parentModule instanceof BaseModule) {
            this._di = new DIModule((parentModule instanceof BaseModule) ? parentModule._di : null);
        } else {
            this._di = new DIModule(null);
        }
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
        // let depInstance = this._getBindingRecursively<T>(token);
        let depInstance = this._getBinding<T>(token);
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
        this._di.setDependency(dependency("RoutesDefinition", { value: value }));
        return this;
    }

    public getJsonRoutes(): any {
        return this._di.getDependency<any>("RoutesDefinition");
    }

    protected abstract init(): void;

    private _getBinding<T>(abstraction: string | Constructor<T>): T {
        return this._di.hasDependency(abstraction) ?
            this._di.getDependency<T>(abstraction) :
            null;
    }

}