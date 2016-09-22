import {getClassName} from "../core/utils";
import {ServiceMetadata, ServiceMetadataDescriptor} from "../service";

const FILTER_METADATA_KEY = "tedi:filter";

export interface FilterMetadataDescriptor {
    service: ServiceMetadataDescriptor;
}

export class FilterMetadata {

    public static setMetadata(target: Object): void {
        let className = getClassName(target);
        if (this.getMetadata(target)) {
            throw new Error(`Filter metadata for target ${className} already exists`);
        }
        let filterMetadata = <FilterMetadataDescriptor> {
            service: ServiceMetadata.getMetadata(target),
        };
        Reflect.defineMetadata(FILTER_METADATA_KEY, filterMetadata, target);
    }

    public static getMetadata(target: Object): FilterMetadataDescriptor {
        return <FilterMetadataDescriptor> Reflect.getMetadata(FILTER_METADATA_KEY, target);
    }
}
