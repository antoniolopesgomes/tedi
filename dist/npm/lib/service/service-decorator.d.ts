import { CustomError } from "../core";
export declare class ServiceDecoratorError extends CustomError {
    constructor(controllerName: string, msg: string, error?: any);
}
export interface BaseServiceDecorator {
    (): (target: Object) => void;
}
export declare const Service: BaseServiceDecorator;
