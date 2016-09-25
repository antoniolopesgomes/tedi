import * as inversify from "inversify";

export * from "./di-module";
export * from "./dependency";

export type DIToken = string | symbol | inversify.interfaces.Newable<any>;

export function inject(token: DIToken): ParameterDecorator {
    return inversify.inject(token);
}

export function injectable(): ClassDecorator {
    return inversify.injectable();
}
