"use strict";
import {ControllerMetadata} from "./controller-metadata";
import {Dependency} from "../di";
import * as METADATA_KEYS from "../constants/metadata-keys";
import * as ERRORS from "../constants/error-messages";
import {CustomError} from "../core";

// CUSTOM ERRORS USED BY THIS MODULE

export class ControllerDecoratorError extends CustomError {
    constructor(controllerName: string, msg: string, error?: any) {
        super(`${controllerName}": ${msg}`, error);
    }
}

export class ControllerActionDecoratorError extends CustomError {
    constructor(controllerName: string, actionName: string, msg: string, error?: any) {
        super(`${controllerName}#${actionName}: ${msg}`, error);
    }
}

// CONTROLLER DECORATOR

export interface BaseControllerDecorator {
    (): (target: Object) => void;
    get: () => MethodDecorator;
    post: () => MethodDecorator;
    delete: () => MethodDecorator;
    put: () => MethodDecorator;
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

(<BaseControllerDecorator> ControllerDecorator).get = function (): MethodDecorator {
    return ControllerActionMethodDecorator("GET");
};

(<BaseControllerDecorator> ControllerDecorator).post = function (): MethodDecorator {
    return ControllerActionMethodDecorator("POST");
};

(<BaseControllerDecorator> ControllerDecorator).delete = function (): MethodDecorator {
    return ControllerActionMethodDecorator("DELETE");
};

(<BaseControllerDecorator> ControllerDecorator).put = function (): MethodDecorator {
    return ControllerActionMethodDecorator("PUT");
};

function ControllerActionMethodDecorator(action: string): MethodDecorator {
    return function (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
        let targetConstructorName = (<any> target).constructor.name;
        if (ControllerMetadata.actionMethodName(action, target)) {
            throw new ControllerActionDecoratorError(targetConstructorName, action.toUpperCase(), ERRORS.CONTROLLER_ACTION_DUPLICATE);
        }
        Reflect.defineMetadata(METADATA_KEYS[action.toUpperCase()], propertyKey, target);
    };
}

export const Controller = <BaseControllerDecorator> ControllerDecorator;
