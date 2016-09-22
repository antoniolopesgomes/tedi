"use strict";
import {TediError} from "../core";
import {getClassName} from "../core/utils";
import {Service} from "../service";
import {ErrorHandlerMetadata} from "./error-handler-metadata";

// CUSTOM ERRORS USED BY THIS MODULE

export class ErrorHandlerDecoratorError extends TediError {
    constructor(errorHandler: any, msg: string, error?: any) {
        super(`${getClassName(errorHandler)}": ${msg}`, error);
    }
}

// ERROR HANDLER DECORATOR

// TODO maybe I can remove this?
export interface BaseErrorHandlerDecorator {
    (): (target: any) => void;
}

function ErrorHandlerDecorator(): ClassDecorator {
    return function (target: Object) {
        try {
            Service()(target);
            ErrorHandlerMetadata.setMetadata(target);
        } catch (error) {
            throw new ErrorHandlerDecoratorError(target, "Failed to decorate method", error);
        }
    };
}

/* tslint:disable */
export const ErrorHandler = <BaseErrorHandlerDecorator> ErrorHandlerDecorator;
/* tslint:enable */
