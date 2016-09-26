"use strict";
import { InjectableDecorator } from "../di/decorators";
import { TediError } from "../errors";
import { getClassName } from "../utils";
import { ErrorHandlerHelper, ErrorHandlerMetadata } from "./helper";

// CUSTOM ERRORS USED BY THIS MODULE

export class ErrorHandlerDecoratorError extends TediError {
    constructor(target: Object, msg: string, error?: any) {
        super(`${getClassName(target)}": ${msg}`, error);
    }
}

// DECORATOR

let errorHandlerHelper = new ErrorHandlerHelper();

export function ErrorHandlerDecorator(): ClassDecorator {
    return function (target: Object) {
        if (errorHandlerHelper.getMetadata(target)) {
            throw new ErrorHandlerDecoratorError(target, "Failed to decorate class");
        }
        InjectableDecorator()(<any> target);
        errorHandlerHelper.setMetadata(target, <ErrorHandlerMetadata> {
            className: getClassName(target),
        });
    };
}
