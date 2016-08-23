import { CustomError } from "../core";
export declare class ActionError extends CustomError {
    constructor(name: string, methodName: string, err: any);
}
