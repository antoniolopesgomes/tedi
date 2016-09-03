import {FilterMetadata} from "./filter-metadata";
import {TediError} from "../core";
import {BaseFilter} from "./core";
import {isFunction} from "lodash";

export class FilterValidatorError extends TediError {
    constructor(filter: BaseFilter<any>, msg: string, error?: any) {
        super(`${(<any> filter).constructor.name}: ${msg}`, error);
    }
}

export class FilterValidator {
    public static hasValidMetadata(filter: BaseFilter<any>): boolean {
        return FilterMetadata.isDecorated(filter.constructor);
    }
    public static implementsFilter(filter: BaseFilter<any>): boolean {
        return isFunction(filter.apply) && isFunction(filter.getDataFromRequest);
    }
    public static validate(filter: BaseFilter<any>): void {
        // check if it implements BaseFilter
        if (!this.implementsFilter(filter)) {
            throw new FilterValidatorError(filter, "must implement \"BaseFilter\"");
        }
        // check if it was valid metadata
        if (!this.hasValidMetadata(filter)) {
            throw new FilterValidatorError(filter, "must be decorated with @Filter");
        }
    }
}
