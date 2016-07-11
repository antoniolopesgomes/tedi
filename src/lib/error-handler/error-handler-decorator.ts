'use strict';
import {injectable} from '../di';
import * as METADATA_KEYS from '../constants/metadata-keys';
import * as ERRORS from '../constants/error-messages';
import {CustomError} from '../core';

//CUSTOM ERRORS USED BY THIS MODULE

export class ErrorHandlerDecoratorError extends CustomError {
    constructor(errorHandlerName: string, msg: string, error?: any) {
        super(`${errorHandlerName}': ${msg}`, error);
    }
}

//ERROR HANDLER DECORATOR

export interface IErrorHandlerDecorator {
    (): (target: any) => void;
}

function ErrorHandlerDecorator(): ClassDecorator {
    
    return function (target: Object) {
        try {
            injectable()(target);
            Reflect.defineMetadata(METADATA_KEYS.ERROR_HANDLER, true, target);
        }
        catch (error) {
            throw new ErrorHandlerDecoratorError((<any>target).name, ERRORS.ERROR_HANDLER_ERROR_DECORATING, error);
        }
    }
}

export const ErrorHandler = <IErrorHandlerDecorator> ErrorHandlerDecorator;