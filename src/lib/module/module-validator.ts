import {ModuleMetadata} from "./module-metadata";
import {TediError} from "../core";
import {BindingOptions, BindingContext} from "../di";

export class ModuleValidatorError extends TediError {
    constructor(msg: string, error?: any) {
        super(msg, error);
    }
}

export class ModuleValidator {
    public static isValid(target: Object, options: BindingOptions): boolean {
        let targetIsClass = options.context !== BindingContext.VALUE;
        return ModuleMetadata.isDecorated(targetIsClass ? target : target.constructor);
    }
    public static validate(target: Object, options: BindingOptions): void {
        if (!ModuleValidator.isValid(target, options)) {
            throw new ModuleValidatorError(`target "${(<any> target).constructor.name}" it"s not a valid Module`);
        }
    }
}
