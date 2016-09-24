"use strict";
import { injectable } from "../di";
import { TediError } from "../core";
import { getClassName } from "../core/utils";

// CUSTOM ERRORS USED BY THIS MODULE

export class ModuleDecoratorError extends TediError {
    constructor(target: Object, msg: string, error?: any) {
        super(`${getClassName(target)}": ${msg}`, error);
    }
}

// DECORATOR

const METADATA_KEY = "tedi:module";

export interface ModuleMetadata {
    className: string;
}

export function setMetadata(target: Object, metadata: ModuleMetadata): void {
    Reflect.defineMetadata(METADATA_KEY, metadata, target);
}

export function getMetadata(target: Object): ModuleMetadata {
    return Reflect.getMetadata(METADATA_KEY, target);
}

function ModuleDecorator(): ClassDecorator {
    return function (target: Object) {
        if (getMetadata(target)) {
            throw new ModuleDecoratorError(target, "Failed to decorate class");
        }
        injectable()(<any> target);
        setMetadata(target, <ModuleMetadata> {
            className: getClassName(target),
        });
    };
}

/* tslint:disable */
export const Module = <() => ClassDecorator> ModuleDecorator;
/* tslint:enable */
