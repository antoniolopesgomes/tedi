import { CustomError } from "../core";
export declare class ModuleDecoratorError extends CustomError {
    constructor(moduleName: string, msg: string, error?: any);
}
export interface BaseModuleDecorator {
    (): (target: any) => void;
}
export declare const Module: BaseModuleDecorator;
