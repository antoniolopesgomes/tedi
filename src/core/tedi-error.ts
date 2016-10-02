import { getClassName, Constructor } from "./utils";
/* tslint:disable */
export const NestedError: Constructor<Error> = require("nested-error-stacks");
/* tslint:enable */

export class TediError extends NestedError {

    constructor(msg: string, error: any) {
        super(msg, error);
        (<any> this).name = (<any> this.constructor).name;
    }

    get messageStack(): string {
        let messages: string[] = [];
        let error = this;
        while (error) {
            messages.push(`${getClassName(error)}: ${error.message}`);
            error = (<any> error).nested;
        }
        return messages.join(" -> ");
    }

    public getRootCause(): any {
        let rootCause: any = this;
        while (rootCause.nested) {
            rootCause = rootCause.nested;
        }
        return rootCause;
    }

    public search(errorType: any): any {
        let error: any = this;
        while (error && !(getClassName(error) === getClassName(errorType))) {
            error = error.nested;
        }
        return error;
    }

}
