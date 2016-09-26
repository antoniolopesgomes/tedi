"use strict";
import { InjectableDecorator } from "../di/decorators";
import { TediError } from "../errors";
import { getClassName } from "../utils";
import { ServiceHelper, ServiceMetadata } from "./helper";

// CUSTOM ERRORS USED BY THIS MODULE

export class ServiceDecoratorError extends TediError {
    constructor(target: Object, msg: string, error?: any) {
        super(`${getClassName(target)}": ${msg}`, error);
    }
}

// DECORATOR

let serviceHelper = new ServiceHelper();

export function ServiceDecorator(): ClassDecorator {
    return function (target: Object) {
        if (serviceHelper.getMetadata(target)) {
            throw new ServiceDecoratorError(target, "Failed to decorate class");
        }
        InjectableDecorator()(<any> target);
        serviceHelper.setMetadata(target, <ServiceMetadata> {
            className: getClassName(target),
        });
    };
}
