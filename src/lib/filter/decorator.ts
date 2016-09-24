"use strict";
import { injectable } from "../di";
import { getClassName } from "../core/utils";
import { TediError } from "../core";

// CUSTOM ERRORS USED BY THIS MODULE

export class FilterDecoratorError extends TediError {
    constructor(target: Object, msg: string, error?: any) {
        super(`${getClassName(target)}": ${msg}`, error);
    }
}

// DECORATOR

const METADATA_KEY = "tedi:filter";

export interface FilterMetadata {
    className: string;
}

export function setMetadata(target: Object, metadata: FilterMetadata): void {
    Reflect.defineMetadata(METADATA_KEY, metadata, target);
}

export function getMetadata(target: Object): FilterMetadata {
    return Reflect.getMetadata(METADATA_KEY, target);
}

function FilterDecorator(): ClassDecorator {
    return function (target: Object) {
        if (getMetadata(target)) {
            throw new FilterDecoratorError(target, "Failed to decorate class");
        }
        injectable()(<any> target);
        setMetadata(target, <FilterMetadata> {
            className: getClassName(target),
        });
    };
}

/* tslint:disable */
export const Filter = <() => ClassDecorator> FilterDecorator;
/* tslint:enable */
