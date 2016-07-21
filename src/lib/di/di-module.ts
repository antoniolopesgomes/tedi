import {BindingContext, BindingOptions, DIModuleError} from './core';
import {Constructor} from '../core';
import {Logger} from '../logger';
import {Dependency} from './dependency'; 
import * as inversify from 'inversify';

export class DIModule {

    private _kernel: inversify.interfaces.Kernel;

    constructor() {
        this._kernel = new inversify.Kernel();
    }

    getDependency<T>(token: any): T {
        return this._kernel.get<T>(token);
    }

    hasDependency(token: any): boolean {
        return this._kernel.isBound(token);
    }

    removeDependency(token: any): void {
        this._kernel.unbind(token);
    }

    removeAll(): void {
        this._kernel.unbindAll();
    }

    setDependency<T>(dep: Dependency): void {
        if (!(dep instanceof Dependency)) {
            console.warn(`invalid dependency: ${dep}`);
            return;
        }
        if (this.hasDependency(dep.token)) {
            this.removeDependency(dep.token);
        }
        this._bindDependency(dep);
    }

    snapshot(): void {
        this._kernel.snapshot();
    }

    restore(): void {
        this._kernel.restore();
    }

    private _bindDependency<T>(dep: Dependency): void {

        if(dep.properties.class) {
            let binding = this._kernel.bind<T>(dep.token).to(<Constructor<T>> dep.properties.class);
            if (!dep.properties.classIsTransient) {
                binding.inSingletonScope();
            }
        }
        else if(dep.properties.value) {
            this._kernel.bind<T>(dep.token).toConstantValue(<T> dep.properties.value);
        }
        else {
            throw new DIModuleError(`Invalid dependency: ${dep}`, null);
        }
    }

}