import {DependencyMetadata} from "./dependency-metadata";
import {CustomError} from "../core";
import {BindingOptions, BindingContext} from "../di";

export class DependencyValidatorError extends CustomError {
    constructor(msg: string, error?: any) {
        super(msg, error);
    }
}

export class DependencyValidator {
    public static isDecorated(target: Object, options: BindingOptions): boolean {
        let targetIsClass = options.context !== BindingContext.VALUE;
        return DependencyMetadata.isDecorated(targetIsClass ? target : target.constructor);
    }
    public static validate(target: Object, options: BindingOptions): void {
        if (!DependencyValidator.isDecorated(target, options)) {
            throw new DependencyValidatorError(`target "${(<any> target).constructor.name}" must be decorated with @Dependency`);
        }
    }
}
