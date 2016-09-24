"use strict";
import { injectable } from "../di";
import { TediError } from "../core";
import { getClassName } from "../core/utils";

// CUSTOM ERRORS USED BY THIS MODULE

export class ServiceDecoratorError extends TediError {
    constructor(target: Object, msg: string, error?: any) {
        super(`${getClassName(target)}": ${msg}`, error);
    }
}

// DECORATOR

const METADATA_KEY = "tedi:service";

export interface ServiceMetadata {
    className: string;
}

export function setMetadata(target: Object, metadata: ServiceMetadata): void {
    Reflect.defineMetadata(METADATA_KEY, metadata, target);
}

export function getMetadata(target: Object): ServiceMetadata {
    return Reflect.getMetadata(METADATA_KEY, target);
}

export function validateInstance(instance: any): void {
    // check if it was valid metadata
    if (!getMetadata(instance)) {
        throw new ServiceDecoratorError(instance, "must be decorated with @Service");
    }
}

function ServiceDecorator(): ClassDecorator {
    return function (target: Object) {
        if (getMetadata(target)) {
            throw new ServiceDecoratorError(target, "Failed to decorate class");
        }
        injectable()(<any> target);
        setMetadata(target, <ServiceMetadata> {
            className: getClassName(target),
        });
    };
}

/* tslint:disable */
export const Service = <() => ClassDecorator> ServiceDecorator;

export const ServiceUtils = {
    getMetadata: getMetadata,
    validateInstance: validateInstance,
};
/* tslint:enable */
