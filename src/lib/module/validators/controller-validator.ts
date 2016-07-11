import {ControllerMetadata} from '../../controller';
import {CustomError} from '../../core';
import {BindingOptions, BindingContext} from '../../di';

export class ControllerValidatorError extends CustomError {
    constructor(msg: string, error?: any) {
        super(msg, error);
    }
} 

export class ControllerValidator {
    static isValid(target: Object, options: BindingOptions): boolean {
        let targetIsClass = options.context !== BindingContext.VALUE
        return ControllerMetadata.isDecorated(targetIsClass ? target : target.constructor);
    }
    static validate(target: Object, options: BindingOptions): void {
        if (!ControllerValidator.isValid(target, options)) {
            throw new ControllerValidatorError(`target '${(<any> target).constructor.name}' it's not a valid Controller`);
        }
    }
}