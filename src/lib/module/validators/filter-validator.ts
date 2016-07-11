import {FilterMetadata} from '../../filter';
import {CustomError} from '../../core';
import {BindingOptions, BindingContext} from '../../di';

export class FilterValidatorError extends CustomError {
    constructor(msg: string, error?: any) {
        super(msg, error);
    }
} 

export class FilterValidator {
    static isValid(target: Object, options: BindingOptions): boolean {
        let targetIsClass = options.context !== BindingContext.VALUE
        return FilterMetadata.isDecorated(targetIsClass ? target : target.constructor);
    }
    static validate(target: Object, options: BindingOptions): void {
        if (!FilterValidator.isValid(target, options)) {
            throw new FilterValidatorError(`target '${(<any> target).constructor.name}' it's not a valid Filter`);
        }
    }
}