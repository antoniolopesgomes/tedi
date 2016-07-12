'use strict';
import {injectable} from '../di';
import * as METADATA_KEYS from '../constants/metadata-keys';
import * as ERRORS from '../constants/error-messages';
import {CustomError} from '../core';

//CUSTOM ERRORS USED BY THIS MODULE

export class ServiceDecoratorError extends CustomError {
    constructor(controllerName: string, msg: string, error?: any) {
        super(`${controllerName}': ${msg}`, error);
    }
}

//CONTROLLER DECORATOR

export interface IServiceDecorator {
    (): (target: Object) => void;
}

function ServiceDecorator(): ClassDecorator {

    return function (target: Object) {
        try {
            injectable()(target);
            Reflect.defineMetadata(METADATA_KEYS.SERVICE, true, target);
        }
        catch (error) {
            throw new ServiceDecoratorError((<any>target).name, ERRORS.SERVICE_ERROR_DECORATING, error);
        }
    }
}

export const Service = <IServiceDecorator> ServiceDecorator;