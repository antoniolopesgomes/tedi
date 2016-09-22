"use strict";
import * as _ from "lodash";
import { ControllerMetadata } from "./controller-metadata";
import { TediError } from "../core";
import { getClassName } from "../core/utils";
import { Service } from "../service";
import { HttpMethods, HTTP_METHODS_NAMES } from "../core/http";

// CUSTOM ERRORS USED BY THIS MODULE

export class ControllerDecoratorError extends TediError {
    constructor(controller: any, msg: string, error?: any) {
        super(`${getClassName(controller)}": ${msg}`, error);
    }
}

export class ActionDecoratorError extends TediError {
    constructor(controller: any, actionName: string, msg: string, error?: any) {
        super(`${getClassName(controller)}#${actionName}: ${msg}`, error);
    }
}

// CONTROLLER DECORATOR

export interface BaseControllerDecorator extends HttpMethods<() => MethodDecorator> {
    (): (target: Object) => void;
}

function ControllerDecorator(): ClassDecorator {
    return function (target: Object) {
        try {
            Service()(target);
            ControllerMetadata.setMetadata(target);
        } catch (error) {
            throw new ControllerDecoratorError(target, "Failed to decorate controller", error);
        }
    };
}

_.keys(HTTP_METHODS_NAMES).forEach(httpMethodName => {
    ControllerDecorator[httpMethodName] = function (): MethodDecorator {
        return function (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
            try {
                ControllerMetadata.setActionMetadata(httpMethodName, propertyKey, target);
            } catch (error) {
                throw new ActionDecoratorError(target, httpMethodName, "Failed to decorate method", error);
            }

        };
    };
});
/* tslint:disable */
export const Controller = <BaseControllerDecorator> ControllerDecorator;
/* tslint:enable */
