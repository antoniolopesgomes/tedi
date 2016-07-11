import {ErrorHandlerMetadata} from '../../error-handler';
import {CustomError} from '../../core';
import {BindingOptions, BindingContext} from '../../di';

export class ErrorHandlerValidatorError extends CustomError {
    constructor(msg: string, error?: any) {
        super(msg, error);
    }
} 

export class ErrorHandlerValidator {
    static isValid(target: Object, options: BindingOptions): boolean {
        let targetIsClass = options.context !== BindingContext.VALUE
        return ErrorHandlerMetadata.isDecorated(targetIsClass ? target : target.constructor);
    }
    static validate(target: Object, options: BindingOptions): void {
        if (!ErrorHandlerValidator.isValid(target, options)) {
            throw new ErrorHandlerValidatorError(`target '${(<any> target).constructor.name}' it's not a valid ErrorHandler`);
        }
    }
}