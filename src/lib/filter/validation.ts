import { isFunction } from "lodash";
import { FilterError, BaseFilter } from "./core";
import { getMetadata } from "./decorator";

export function validateInstance(instance: BaseFilter<any>): void {
    // check if instance class has valid metadata
    if (!getMetadata((<Object> instance).constructor)) {
        throw new FilterError(instance, "must be decorated with @Filter");
    }
    if (!isFunction(instance.apply) || !isFunction(instance.getDataFromRequest)) {
        throw new FilterError(instance, "invalid: must implement Filter");
    }
}
