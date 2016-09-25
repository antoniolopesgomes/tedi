import {getClassName} from "../utils";
import {TediError} from "../errors";
import {ActionMetadata, ControllerHelper} from "./helper";

export class ActionDecoratorError extends TediError {
    constructor(target: Object, msg: string, error?: any) {
        super(`${getClassName(target)}: ${msg}`, error);
    }
}

let controllerHelper = new ControllerHelper();

export function ActionDecorator(httpMethodName: string): () => MethodDecorator {
    return function (): MethodDecorator {
        return function (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
            if (controllerHelper.getActionMetadata(httpMethodName, target)) {
                throw new ActionDecoratorError(target, `duplicate decoration found for @${httpMethodName}`);
            }
            controllerHelper.setActionMetadata(httpMethodName, <ActionMetadata> {
                className: getClassName(target),
                methodName: propertyKey,
            }, target);
        };
    };
}
