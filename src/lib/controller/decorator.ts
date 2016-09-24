"use strict";
import { keys } from "lodash";
import { injectable } from "../di";
import { TediError } from "../core";
import { HttpMethods, HTTP_METHODS_NAMES } from "../core/http";
import { getClassName } from "../core/utils";
/* tslint:disable */
import { ActionDecorator, ActionUtils, ActionMetadata } from "./action-decorator";
/* tslint:enable */

class ControllerDecoratorError extends TediError {
    constructor(target: Object, msg: string, error?: any) {
        super(`Controller decorator: ${getClassName(target)}: ${msg}`, error);
    }
}

// DECORATOR

const METADATA_KEY = "tedi:controller";

export interface ControllerMetadata {
    className: string;
}

export interface ControllerDecorator extends HttpMethods<() => MethodDecorator> {
    (): ClassDecorator;
}

function setMetadata(target: Object, metadata: ControllerMetadata): void {
    Reflect.defineMetadata(METADATA_KEY, metadata, target);
}

function getMetadata(target: Object): ControllerMetadata {
    return Reflect.getMetadata(METADATA_KEY, target);
}

function validateInstance(instance: any): void {
    // check if it was valid metadata
    if (!getMetadata(instance)) {
        throw new ControllerDecoratorError(instance, "must be decorated with @Filter");
    }
}

let controllerDecorator = <ControllerDecorator>function () {
    return function (target: Object) {
        if (getMetadata(target)) {
            throw new ControllerDecoratorError(target, "Class was alredy decorated");
        }
        injectable()(<any> target);
        setMetadata(target, <ControllerMetadata> {
            className: getClassName(target),
        });
    };
};

keys(HTTP_METHODS_NAMES).forEach(httpMethodName => {
    controllerDecorator[httpMethodName] = ActionDecorator(httpMethodName);
});

/* tslint:disable */
export const Controller = controllerDecorator;

export const ControllerUtils = {
    getMetadata: getMetadata,
    getActionMetadata: ActionUtils.getMetadata,
    validateInstance: validateInstance,
}
/* tslint:enable */
