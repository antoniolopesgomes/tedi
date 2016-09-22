import {isFunction} from "lodash";
import {FilterMetadata} from "./filter-metadata";
import {TediError} from "../core";
import {getClassName} from "../core/utils";
import {BaseFilter} from "./core";

export class FilterValidatorError extends TediError {
    constructor(filter: BaseFilter<any>, msg: string, error?: any) {
        super(`${getClassName(filter)}: ${msg}`, error);
    }
}

export class FilterValidator {

    public static implementsFilter(filter: BaseFilter<any>): boolean {
        return isFunction(filter.apply) && isFunction(filter.getDataFromRequest);
    }

    public static validate(filter: BaseFilter<any>): void {
        // check if it implements BaseFilter
        if (!this.implementsFilter(filter)) {
            throw new FilterValidatorError(filter, "must implement 'BaseFilter'");
        }
        // check if it was valid metadata
        if (!FilterMetadata.getMetadata(filter)) {
            throw new FilterValidatorError(filter, "must be decorated with @Filter");
        }
    }
}
