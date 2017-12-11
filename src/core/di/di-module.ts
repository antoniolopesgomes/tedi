import { TediError } from "../tedi-error";
import { Constructor } from "../utils";
import { DependencyInfo } from "./dependency";
import * as inversify from "inversify";

export class DIModuleError extends TediError {
    constructor(msg: string, error?: any) {
        super(`${msg}`, error);
    }
}

export class DIModule {

    private _container: inversify.Container = new inversify.Container();

    public __setParent(diModule: DIModule): void {
        (<any>this._container).parent = diModule._container;
    }

    public getDIContainer(): any { 
        return this._container;
    }

    public getDependency<T>(token: any): T {
        try {
            return this._container.get<T>(token);
        } catch (error) {
            throw new DIModuleError(error.message);
        }
    }

    public hasDependency(token: any): boolean {
        return this._container.isBound(token);
    }

    public hasOwnDependency(token: any): boolean {
        // TODO check this!!! 
        return (<any>this._container)._bindingDictionary.hasKey(token);
    }

    public removeDependency(token: any): void {
        this._container.unbind(token);
    }

    public removeAll(): void {
        this._container.unbindAll();
    }

    public setDependency<T>(dep: DependencyInfo): void {
        if (!(dep instanceof DependencyInfo)) {
            console.warn(`invalid dependency: ${dep}`);
            return;
        }
        if (this.hasOwnDependency(dep.token)) {
            this.removeDependency(dep.token);
        }
        this._bindDependency(dep);
    }

    public snapshot(): void {
        this._container.snapshot();
    }

    public restore(): void {
        this._container.restore();
    }

    private _bindDependency<T>(dep: DependencyInfo): void {

        if (dep.properties.class) {
            let concretion = <Constructor<T>>dep.properties.class;
            // DependencyValidator.validate(concretion);
            let binding = this._container.bind(dep.token).to(concretion);
            if (!dep.properties.transient) {
                binding.inSingletonScope();
            }
        } else if (dep.properties.value) {
            let concretion = dep.properties.value;
            this._container.bind(dep.token).toConstantValue(concretion);
        } else {
            throw new DIModuleError(`Invalid dependency: ${dep}`, null);
        }
    }

}
