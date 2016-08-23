import { CustomError } from "../core";
export declare class DependencyDecoratorError extends CustomError {
    constructor(dependencyName: string, msg: string, error?: any);
}
export interface BaseDependencyDecorator {
    (): (target: any) => void;
}
export declare const Dependency: BaseDependencyDecorator;
