import { CustomError } from "../core";
export declare class ControllerDecoratorError extends CustomError {
    constructor(controllerName: string, msg: string, error?: any);
}
export declare class ControllerActionDecoratorError extends CustomError {
    constructor(controllerName: string, actionName: string, msg: string, error?: any);
}
export interface BaseControllerDecorator {
    (): (target: Object) => void;
    get: () => MethodDecorator;
    post: () => MethodDecorator;
    delete: () => MethodDecorator;
    put: () => MethodDecorator;
}
export declare const Controller: BaseControllerDecorator;
