import {getClassName} from "../core/utils";

const SERVICE_METADATA_KEY = "tedi:service";

export interface ServiceMetadataDescriptor {
    className: string;
}

export class ServiceMetadata {

    public static setMetadata(target: Object): void {
        let className = getClassName(target);
        if (this.getMetadata(target)) {
            throw new Error(`Service metadata for '${className}' already exists`);
        }
        let serviceMetadataDescriptor = <ServiceMetadataDescriptor> {
            className: className,
        };
        Reflect.defineMetadata(SERVICE_METADATA_KEY, serviceMetadataDescriptor, target);
    }

    public static getMetadata(target: Object): ServiceMetadataDescriptor {
        return <ServiceMetadataDescriptor> Reflect.getMetadata(SERVICE_METADATA_KEY, target);
    }
}
