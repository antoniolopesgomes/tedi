import {ErrorHandlerMetadata} from './error-handler-metadata';
import {CustomError} from '../core';
import {BindingOptions, BindingContext} from '../di';
import {BaseErrorHandler} from './core';
import {isFunction} from 'lodash';

export class ErrorHandlerValidatorError extends CustomError {
    constructor(errorHandler: BaseErrorHandler, msg: string, error?: any) {
        super(`${(<any>errorHandler).constructor.name}: ${msg}`, error);
    }
} 

export class ErrorHandlerValidator {
    static hasValidMetadata(errorHandler: BaseErrorHandler): boolean {
        return ErrorHandlerMetadata.isDecorated(errorHandler.constructor);
    }
    static implementsErrorHandler(errorHandler: BaseErrorHandler): boolean {
        return isFunction(errorHandler.catch);
    }
    static validate(errorHandler: BaseErrorHandler): void {
        //check if it implements BaseFilter
        if (!this.implementsErrorHandler(errorHandler)) {
            throw new ErrorHandlerValidatorError(errorHandler, 'must implement \'BaseErrorHandler\'');
        }
        //check if it was valid metadata
        if (!this.hasValidMetadata(errorHandler)) {
            throw new ErrorHandlerValidatorError(errorHandler, 'must be decorated with @ErrorHandler');
        }
    }
}