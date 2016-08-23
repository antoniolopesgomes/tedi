import { DependencyInfo } from "./dependency";
export declare class DIModule {
    private _kernel;
    constructor();
    getDependency<T>(token: any): T;
    hasDependency(token: any): boolean;
    removeDependency(token: any): void;
    removeAll(): void;
    setDependency<T>(dep: DependencyInfo): void;
    snapshot(): void;
    restore(): void;
    private _bindDependency<T>(dep);
}
