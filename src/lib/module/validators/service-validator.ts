import {ServiceMetadata} from '../../service';
import {CustomError} from '../../core';
import {BindingOptions, BindingContext} from '../../di';

export class ServiceValidatorError extends CustomError {
    constructor(msg: string, error?: any) {
        super(msg, error);
    }
} 

export class ServiceValidator {
    static isValid(target: Object, options: BindingOptions): boolean {
        let targetIsClass = options.context !== BindingContext.VALUE
        return ServiceMetadata.isDecorated(targetIsClass ? target : target.constructor);
    }
    static validate(target: Object, options: BindingOptions): void {
        if (!ServiceValidator.isValid(target, options)) {
            throw new ServiceValidatorError(`target '${(<any> target).constructor.name}' it's not a valid Service`);
        }
    }
}