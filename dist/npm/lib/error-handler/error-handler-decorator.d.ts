import { CustomError } from "../core";
export declare class ErrorHandlerDecoratorError extends CustomError {
    constructor(errorHandlerName: string, msg: string, error?: any);
}
export interface BaseErrorHandlerDecorator {
    (): (target: any) => void;
}
export declare const ErrorHandler: BaseErrorHandlerDecorator;
