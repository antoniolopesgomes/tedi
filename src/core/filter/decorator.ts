"use strict";
import { InjectableDecorator } from "../di/decorators";
import { getClassName } from "../utils";
import { TediError } from "../errors";
import { FilterHelper, FilterMetadata } from "./helper";

// CUSTOM ERRORS USED BY THIS MODULE

export class FilterDecoratorError extends TediError {
    constructor(target: Object, msg: string, error?: any) {
        super(`${getClassName(target)}": ${msg}`, error);
    }
}

// DECORATOR

let filterHelper = new FilterHelper();

export function FilterDecorator(): ClassDecorator {
    return function (target: Object) {
        if (filterHelper.getMetadata(target)) {
            throw new FilterDecoratorError(target, "Failed to decorate class");
        }
        InjectableDecorator()(<any> target);
        filterHelper.setMetadata(target, <FilterMetadata> {
            className: getClassName(target),
        });
    };
}
