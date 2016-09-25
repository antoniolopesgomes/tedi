"use strict";
import { injectable } from "../di";
import { TediError } from "../errors";
import { getClassName } from "../utils";
import { ModuleHelper, ModuleMetadata } from "./helper";

// CUSTOM ERRORS USED BY THIS MODULE

export class ModuleDecoratorError extends TediError {
    constructor(target: Object, msg: string, error?: any) {
        super(`${getClassName(target)}": ${msg}`, error);
    }
}

// DECORATOR

let moduleHelper = new ModuleHelper();

function ModuleDecorator(): ClassDecorator {
    return function (target: Object) {
        if (moduleHelper.getMetadata(target)) {
            throw new ModuleDecoratorError(target, "Failed to decorate class");
        }
        injectable()(<any> target);
        moduleHelper.setMetadata(target, <ModuleMetadata> {
            className: getClassName(target),
        });
    };
}

/* tslint:disable */
export const Module = <() => ClassDecorator> ModuleDecorator;
/* tslint:enable */
