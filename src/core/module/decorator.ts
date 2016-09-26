"use strict";
import { InjectableDecorator } from "../di/decorators";
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

export function ModuleDecorator(): ClassDecorator {
    return function (target: Object) {
        if (moduleHelper.getMetadata(target)) {
            throw new ModuleDecoratorError(target, "Failed to decorate class");
        }
        InjectableDecorator()(<any> target);
        moduleHelper.setMetadata(target, <ModuleMetadata> {
            className: getClassName(target),
        });
    };
}
