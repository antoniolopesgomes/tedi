import { CustomError } from "../core";
export declare class ControllerValidatorError extends CustomError {
    constructor(controller: any, msg: string, error?: any);
}
export declare class ControllerValidator {
    static hasValidMetadata(controller: any): boolean;
    static validate(controller: any): void;
}
