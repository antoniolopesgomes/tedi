'use strict';
import {injectable} from '../di';
import * as METADATA_KEYS from '../constants/metadata-keys';
import * as ERRORS from '../constants/error-messages';
import {CustomError} from '../core';

//CUSTOM ERRORS USED BY THIS MODULE

export class ModuleDecoratorError extends CustomError {
    constructor(moduleName: string, msg: string, error?: any) {
        super(`${moduleName}': ${msg}`, error);
    }
}

//MODULE DECORATOR

export interface IModuleDecorator {
    (): (target: any) => void;
}

function ModuleDecorator(): ClassDecorator {
    
    return function (target: Object) {
        try {
            injectable()(target);
            Reflect.defineMetadata(METADATA_KEYS.MODULE, true, target);
        }
        catch (error) {
            throw new ModuleDecoratorError((<any>target).name, ERRORS.CONTROLLER_ERROR_DECORATING, error);
        }
    }
}

export const Module = <IModuleDecorator> ModuleDecorator;