import {TediError} from "../core";

import * as inversify from "inversify";

export enum BindingContext {
    SINGLETON,
    TRANSIENT,
    VALUE
}

export interface BindingOptions {
    context: BindingContext;
}

export class DIModuleError extends TediError {
    constructor(msg: string, error: any) {
        super(`${msg}`, error);
    }
}

export type DIToken = string | symbol | inversify.interfaces.Newable<any>;

export function inject(token: DIToken): ParameterDecorator {
    return inversify.inject(token);
}

export function injectable(): ClassDecorator {
    return inversify.injectable();
}
