import { isFunction } from "lodash";
import { BaseFilter, FilterError } from "./errors";

const METADATA_KEY = "tedi:filter";

export interface FilterMetadata {
    className: string;
}

export class FilterHelper {

    setMetadata(target: Object, metadata: FilterMetadata): void {
        Reflect.defineMetadata(METADATA_KEY, metadata, target);
    }

    getMetadata(target: Object): FilterMetadata {
        return Reflect.getMetadata(METADATA_KEY, target);
    }

    validateInstance(instance: BaseFilter<any>): void {
        // check if instance class has valid metadata
        if (!this.getMetadata((<Object> instance).constructor)) {
            throw new FilterError(instance, "must be decorated with @Filter");
        }
        if (!isFunction(instance.apply) || !isFunction(instance.getDataFromRequest)) {
            throw new FilterError(instance, "invalid: must implement Filter");
        }
    }
}
