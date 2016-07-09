'use strict';
import * as inversify from 'inversify';
import * as METADATA_KEYS from './constants/metadata-keys';
import * as ERRORS from './constants/error-messages';
import {CustomError} from '../core';

//CUSTOM ERRORS USED BY THIS MODULE

export class ControllerDecoratorError extends CustomError {
    constructor(controllerName: string, msg: string, error?: any) {
        super(`${controllerName}': ${msg}`, error);
    }
}

export class ControllerActionDecoratorError extends CustomError {
    constructor(controllerName: string, actionName: string, msg: string, error?: any) {
        super(`${controllerName}#${actionName}: ${msg}`, error);
    }
}

//CONTROLLER METADATA HELPER

export class ControllerMetadata {
    isPresent(target: Object): boolean {
        return Reflect.hasMetadata(METADATA_KEYS.CONTROLLER, target);
    }
    actionMethodName(action: string, target: Object): string {
        return <string> Reflect.getMetadata(METADATA_KEYS[action.toUpperCase()], target);
    }
    GETMethodName(target: Object): string {
        return this.actionMethodName('GET', target);
    }
    POSTMethodName(target: Object): string {
        return this.actionMethodName('POST', target);
    }
    DELETEMethodName(target: Object): string {
        return this.actionMethodName('DELETE', target);
    }
    PUTMethodName(target: Object): string {
        return this.actionMethodName('PUT', target);
    }
}

//CONTROLLER DECORATOR

export interface IController {
    (): (target: any) => void;
    metadata: ControllerMetadata;
    get: () => MethodDecorator;
    post: () => MethodDecorator;
    delete: () => MethodDecorator;
    put: () => MethodDecorator;
}

function ControllerDecorator(): ClassDecorator {
    
    return function (target: Object) {
        try {
            inversify.injectable()(target);
            Reflect.defineMetadata(METADATA_KEYS.CONTROLLER, true, target);
        }
        catch (error) {
            throw new ControllerDecoratorError((<any>target).name, ERRORS.CONTROLLER_ERROR_DECORATING, error);
        }
    }
}

(<IController>ControllerDecorator).metadata = new ControllerMetadata();

(<IController>ControllerDecorator).get = function (): MethodDecorator {
    return ControllerActionMethodDecorator('GET');
};

(<IController>ControllerDecorator).post = function (): MethodDecorator {
    return ControllerActionMethodDecorator('POST');
};

(<IController>ControllerDecorator).delete = function (): MethodDecorator {
    return ControllerActionMethodDecorator('DELETE');
};

(<IController>ControllerDecorator).put = function (): MethodDecorator {
    return ControllerActionMethodDecorator('PUT');
}

function ControllerActionMethodDecorator(action: string): MethodDecorator {
    return function (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
        let targetConstructorName = (<any>target).constructor.name;
        if (Controller.metadata.actionMethodName(action, target)) {
            throw new ControllerActionDecoratorError(targetConstructorName, action.toUpperCase(), ERRORS.CONTROLLER_ACTION_DUPLICATE);
        }
        Reflect.defineMetadata(METADATA_KEYS[action.toUpperCase()], propertyKey, target);
    };
}

export const Controller = <IController>ControllerDecorator;

