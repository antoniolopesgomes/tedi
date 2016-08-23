import "reflect-metadata";
import { Constructor, CustomError } from "../core";
export declare abstract class BaseModule {
    private _parentModule;
    private _di;
    constructor(parentModule?: BaseModule);
    getParentModule(): BaseModule;
    dependencies(...args: any[]): BaseModule;
    setDependency(dep: any): BaseModule;
    setModule(token: any, moduleClass: Constructor<BaseModule>): BaseModule;
    getDependency<T>(token: string | Constructor<T>): T;
    snapshot(): BaseModule;
    restore(): BaseModule;
    setJsonRoutes(value: any): BaseModule;
    getJsonRoutes(): any;
    protected abstract init(): void;
    private _getBindingRecursively<T>(abstraction);
}
export declare class ModuleError extends CustomError {
    constructor(module: BaseModule, msg: string, error: any);
}
