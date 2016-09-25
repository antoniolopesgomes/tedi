"use strict";
import { keys } from "lodash";
import { injectable } from "../di";
import { TediError } from "../errors";
import { HttpMethods, HTTP_METHODS_NAMES } from "../http";
import { getClassName } from "../utils";
import { ControllerHelper, ControllerMetadata } from "./helper";
import { ActionDecorator } from "./action-decorator";

class ControllerDecoratorError extends TediError {
    constructor(target: Object, msg: string, error?: any) {
        super(`Controller decorator: ${getClassName(target)}: ${msg}`, error);
    }
}

// DECORATOR

export interface ControllerDecorator extends HttpMethods<() => MethodDecorator> {
    (): ClassDecorator;
}

let controllerHelper = new ControllerHelper();

let controllerDecorator = <ControllerDecorator> function () {
    return function (target: Object) {
        if (controllerHelper.getMetadata(target)) {
            throw new ControllerDecoratorError(target, "Class was alredy decorated");
        }
        injectable()(<any> target);
        controllerHelper.setMetadata(target, <ControllerMetadata>{
            className: getClassName(target),
        });
    };
};

keys(HTTP_METHODS_NAMES).forEach(httpMethodName => {
    controllerDecorator[httpMethodName] = ActionDecorator(httpMethodName);
});

/* tslint:disable */
export const Controller = controllerDecorator;
/* tslint:enable */
