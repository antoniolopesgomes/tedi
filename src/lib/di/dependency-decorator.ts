"use strict";
import {injectable} from "./core";
import * as METADATA_KEYS from "../constants/metadata-keys";
import * as ERRORS from "../constants/error-messages";
import {CustomError} from "../core";

// CUSTOM ERRORS USED BY THIS MODULE

export class DependencyDecoratorError extends CustomError {
    constructor(dependencyName: string, msg: string, error?: any) {
        super(`${dependencyName}": ${msg}`, error);
    }
}

// DEPENDENCY DECORATOR

export interface BaseDependencyDecorator {
    (): (target: any) => void;
}

function DependencyDecorator(): ClassDecorator {
    return function (target: Object) {
        try {
            injectable()(target);
            Reflect.defineMetadata(METADATA_KEYS.DEPENDENCY, true, target);
        } catch (error) {
            throw new DependencyDecoratorError((<any> target).name, ERRORS.DEPENDENCY_ERROR_DECORATING, error);
        }
    };
}

export const Dependency = <BaseDependencyDecorator> DependencyDecorator;
