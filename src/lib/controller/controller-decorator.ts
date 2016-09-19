"use strict";
import * as _ from "lodash";
import * as METADATA_KEYS from "../constants/metadata-keys";
import * as ERRORS from "../constants/error-messages";
import { ControllerMetadata } from "./controller-metadata";
import { Dependency } from "../di";
import { TediError } from "../core";
import { HttpMethods, HTTP_METHODS_NAMES } from "../core/http";

// CUSTOM ERRORS USED BY THIS MODULE

export class ControllerDecoratorError extends TediError {
    constructor(controllerName: string, msg: string, error?: any) {
        super(`${controllerName}": ${msg}`, error);
    }
}

export class ControllerActionDecoratorError extends TediError {
    constructor(controllerName: string, actionName: string, msg: string, error?: any) {
        super(`${controllerName}#${actionName}: ${msg}`, error);
    }
}

// CONTROLLER DECORATOR

export interface BaseControllerDecorator extends HttpMethods<() => MethodDecorator> {
    (): (target: Object) => void;
}

function ControllerDecorator(): ClassDecorator {
    return function (target: Object) {
        try {
            Dependency()(target);
            Reflect.defineMetadata(METADATA_KEYS.CONTROLLER, true, target);
        } catch (error) {
            throw new ControllerDecoratorError((<any> target).name, ERRORS.CONTROLLER_ERROR_DECORATING, error);
        }
    };
}

_.keys(HTTP_METHODS_NAMES).forEach(httpMethodName => {
    ControllerDecorator[httpMethodName] = function (): MethodDecorator {
        return function (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
            let targetConstructorName = (<any> target).constructor.name;
            if (ControllerMetadata.isDecoratedWithHttpMethod(httpMethodName, target)) {
                throw new ControllerActionDecoratorError(targetConstructorName, httpMethodName, ERRORS.CONTROLLER_ACTION_DUPLICATE);
            }
            ControllerMetadata.decorateWithHttpMethod(httpMethodName, propertyKey, target);
        };
    };
});
/* tslint:disable */
export const Controller = <BaseControllerDecorator> ControllerDecorator;
/* tslint:enable */
