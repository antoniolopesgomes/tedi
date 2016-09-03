import {Constructor} from "./interfaces";

export const NestedError: Constructor<Object> = require("nested-error-stacks");

export class TediError extends NestedError {

    constructor(msg: string, error: any) {
        super(msg, error);
        (<any> this).name = (<any> this.constructor).name;
    }

    public getRootCause(): any {
        let rootCause: any = this;
        while (rootCause.nested) {
            rootCause = rootCause.nested;
        }
        return rootCause;
    }

}
