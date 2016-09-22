"use strict";
import {TediError} from "../core";
import {getClassName} from "../core/utils";
import {Service} from "../service";
import {FilterMetadata} from "./filter-metadata";

// CUSTOM ERRORS USED BY THIS MODULE

export class FilterDecoratorError extends TediError {
    constructor(filter: any, msg: string, error?: any) {
        super(`${getClassName(filter)}": ${msg}`, error);
    }
}

// FILTER DECORATOR

// TODO maybe I can remove this?
export interface BaseFilterDecorator {
    (): (target: any) => void;
}

function FilterDecorator(): ClassDecorator {
    return function (target: Object) {
        try {
            Service()(target);
            FilterMetadata.setMetadata(target);
        } catch (error) {
            throw new FilterDecoratorError(target, "Failed to decorate method", error);
        }
    };
}

/* tslint:disable */
export const Filter = <BaseFilterDecorator> FilterDecorator;
/* tslint:disable */
