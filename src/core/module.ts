import "reflect-metadata";
import { isArray, isUndefined, isNull } from "lodash";
import { DIModule, dependency, DependencyInfo, DIToken, getTokenDescription } from "./di";
import { TediError } from "./tedi-error";
import { getClassName } from "./utils";

export class ModuleError extends TediError {
    constructor(target: Object, msg: string, error?: any) {
        super(`${getClassName(target)}: ${msg}`, error);
    }
}

export function validateModule(instance: Module): void {
    // check if it was valid metadata
    if (!(instance instanceof Module)) {
        throw new ModuleError(instance, `must be an instance of ${getClassName(Module)}`);
    }
}

export class Module {

    private _parentModule: Module = null;
    private _di: DIModule = new DIModule();

    public __setParent(module: Module): void {
        this._parentModule = module;
        this._di.__setParent(module._di);
    }

    public getParentModule(): Module {
        return this._parentModule;
    }

    public dependencies(...args: any[]): Module {
        // normalize dependecies and iterate
        (isArray(args) ? args : []).forEach((dep: any) => {
            this.setDependency(dep);
        });
        return this;
    }

    public setDependency(dep: any): Module {
        if (isUndefined(dep) || isNull(dep)) {
            return this;
        }
        else if (isArray(dep)) {
            (<any[]> dep).forEach(aDep => this.setDependency(aDep));
        }
        else if (!(dep instanceof DependencyInfo)) {
            this._di.setDependency(dependency(dep));
        }
        else {
            this._di.setDependency(dep);
        }
        return this;
    }

    public getDependency<T>(token: DIToken<T>): T {
        // let depInstance = this._getBindingRecursively<T>(token);
        let depInstance: T;
        try {
            depInstance = this._getBinding<T>(token);
        } catch (error) {
            throw new ModuleError(this, `Error loading dependency for token ${getTokenDescription(token)}`, error);
        }
        if (!depInstance) {
            throw new ModuleError(this, `Could not find dependency "${getTokenDescription(token)}" in the module tree`, null);
        }
        return depInstance;
    }

    public hasDependency(token: DIToken<any>): boolean {
        return this._di.hasDependency(token);
    }

    public setModule(token: any, module: Module): Module {
        if (!(module instanceof Module)) {
            throw new ModuleError(this, `Expected a Module instance`, null);
        }
        // initialize module
        module.__setParent(this);
        // set dependency
        this.setDependency(dependency(token, { value: module }));
        return this;
    }

    public snapshot(): Module {
        this._di.snapshot();
        return this;
    }

    public restore(): Module {
        this._di.restore();
        return this;
    }

    public setJsonRoutes(value: any): Module {
        this._di.setDependency(dependency("RoutesDefinition", { value: value }));
        return this;
    }

    public getJsonRoutes(): any {
        return this._di.getDependency<any>("RoutesDefinition");
    }

    private _getBinding<T>(token: DIToken<T>): T {
        return this._di.hasDependency(token) ?
            this._di.getDependency<T>(token) :
            null;
    }

}
