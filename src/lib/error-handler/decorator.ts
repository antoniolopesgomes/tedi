"use strict";
import { injectable } from "../di";
import { TediError } from "../core";
import { getClassName } from "../core/utils";

// CUSTOM ERRORS USED BY THIS MODULE

export class ErrorHandlerDecoratorError extends TediError {
    constructor(target: Object, msg: string, error?: any) {
        super(`${getClassName(target)}": ${msg}`, error);
    }
}

// DECORATOR

const METADATA_KEY = "tedi:errorHandler";

export interface ErrorHandlerMetadata {
    className: string;
}

export function setMetadata(target: Object, metadata: ErrorHandlerMetadata): void {
    Reflect.defineMetadata(METADATA_KEY, metadata, target);
}

export function getMetadata(target: Object): ErrorHandlerMetadata {
    return Reflect.getMetadata(METADATA_KEY, target);
}

function ErrorHandlerDecorator(): ClassDecorator {
    return function (target: Object) {
        if (getMetadata(target)) {
            throw new ErrorHandlerDecoratorError(target, "Failed to decorate class");
        }
        injectable()(<any> target);
        setMetadata(target, <ErrorHandlerMetadata> {
            className: getClassName(target),
        });
    };
}

/* tslint:disable */
export const ErrorHandler = <() => ClassDecorator> ErrorHandlerDecorator;
/* tslint:enable */
