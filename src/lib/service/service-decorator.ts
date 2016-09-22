"use strict";
import {injectable} from "../di";
import {TediError} from "../core";
import {getClassName} from "../core/utils";
import {ServiceMetadata} from "./service-metadata";

// CUSTOM ERRORS USED BY THIS MODULE

export class ServiceDecoratorError extends TediError {
    constructor(target: Object, msg: string, error?: any) {
        super(`${getClassName(target)}": ${msg}`, error);
    }
}

// SEFVICE DECORATOR

export interface BaseServiceDecorator {
    (): (target: Object) => void;
}

function ServiceDecorator(): ClassDecorator {
    return function (target: Object) {
        try {
            injectable()(<any> target);
            ServiceMetadata.setMetadata(target);
        } catch (error) {
            throw new ServiceDecoratorError(target, "Failed to decorate class", error);
        }
    };
}

/* tslint:disable */
export const Service = <BaseServiceDecorator> ServiceDecorator;
/* tslint:enable */
