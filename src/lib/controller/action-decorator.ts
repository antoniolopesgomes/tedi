import {getClassName} from "../core/utils";
import {TediError} from "../core";

export class ActionDecoratorError extends TediError {
    constructor(target: Object, msg: string, error?: any) {
        super(`${getClassName(target)}: ${msg}`, error);
    }
}

export interface ActionMetadata {
    className: string;
    methodName: string;
}

function getActionMetadataKey(httpMethodName: string): string {
    return `tedi:controller:${httpMethodName}`;
}

function setMetadata(httpMethodName: string, metadata: ActionMetadata, target: Object): void {
    Reflect.defineMetadata(getActionMetadataKey(httpMethodName), metadata, target);
}

function getMetadata(httpMethodName: string, target: Object): ActionMetadata {
    return Reflect.getMetadata(getActionMetadataKey(httpMethodName), target);
}

export function ActionDecorator(httpMethodName: string): () => MethodDecorator {
    return function (): MethodDecorator {
        return function (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
            if (getMetadata(httpMethodName, target)) {
                throw new ActionDecoratorError(target, `duplicate decoration found for @${httpMethodName}`);
            }
            setMetadata(httpMethodName, <ActionMetadata> {
                className: getClassName(target),
                methodName: propertyKey,
            }, target);
        };
    };
}

/* tslint:disable */
export const ActionUtils = {
    getMetadata: getMetadata,
};
/* tslint:enable */
