"use strict";
import {Dependency} from "../di";
import * as METADATA_KEYS from "../constants/metadata-keys";
import * as ERRORS from "../constants/error-messages";
import {TediError} from "../core";

// CUSTOM ERRORS USED BY THIS MODULE

export class ErrorHandlerDecoratorError extends TediError {
    constructor(errorHandlerName: string, msg: string, error?: any) {
        super(`${errorHandlerName}": ${msg}`, error);
    }
}

// ERROR HANDLER DECORATOR

export interface BaseErrorHandlerDecorator {
    (): (target: any) => void;
}

function ErrorHandlerDecorator(): ClassDecorator {
    return function (target: Object) {
        try {
            Dependency()(target);
            Reflect.defineMetadata(METADATA_KEYS.ERROR_HANDLER, true, target);
        } catch (error) {
            throw new ErrorHandlerDecoratorError((<any> target).name, ERRORS.ERROR_HANDLER_ERROR_DECORATING, error);
        }
    };
}

export const ErrorHandler = <BaseErrorHandlerDecorator> ErrorHandlerDecorator;
