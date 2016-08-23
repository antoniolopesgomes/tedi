import { CustomError } from "../core";
export declare class FilterDecoratorError extends CustomError {
    constructor(filterName: string, msg: string, error?: any);
}
export interface BaseFilterDecorator {
    (): (target: any) => void;
}
export declare const Filter: BaseFilterDecorator;
