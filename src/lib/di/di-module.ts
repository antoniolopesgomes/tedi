import {BindingContext, BindingOptions, DIModuleError} from './core';
import {Constructor} from '../core';
import * as inversify from 'inversify';

export class DIModule {

    private _kernel: inversify.interfaces.Kernel;

    constructor() {
        this._kernel = new inversify.Kernel();
    }

    getBinding<T>(abstraction: string | Constructor<T>): T {
        return this._kernel.get<T>(<any>abstraction);
    }

    hasBinding(abstraction: string | Constructor<any>): boolean {
        return this._kernel.isBound(abstraction);
    }

    unbindFromKernel(abstraction: string | Constructor<any>): void {
        this._kernel.unbind(abstraction);
    }

    unbindAll(): void {
        this._kernel.unbindAll();
    }

    bindToKernel<T>(
        abstraction: string | Constructor<T>,
        concretion: Constructor<T> | T,
        options: BindingOptions = { context: BindingContext.SINGLETON }
    ): void {
        switch (options.context) {
            case BindingContext.SINGLETON:
                this._kernel.bind<T>(abstraction).to(<Constructor<T>>concretion).inSingletonScope();
                break;
            case BindingContext.TRANSIENT:
                this._kernel.bind<T>(abstraction).to(<Constructor<T>>concretion)
                break;
            case BindingContext.VALUE:
                this._kernel.bind<T>(abstraction).toConstantValue(<T>concretion);
                break;
            default:
                throw new DIModuleError('Unknown binding context', null);
        }
    }

    setBinding<T>(
        abstraction: string | Constructor<T>,
        concretion: Constructor<T> | T,
        options?: BindingOptions
    ): void {
        //if no concretion was defined assume that this abstraction binding is a class and register it as the concretion
        if (!concretion) {
            concretion = <Constructor<T>>abstraction;
        }
        if (this.hasBinding(abstraction)) {
            this.unbindFromKernel(abstraction);
        }
        this.bindToKernel(abstraction, concretion, options)
    }

    snapshot(): void {
        this._kernel.snapshot();
    }

    restore(): void {
        this._kernel.restore();
    }

}