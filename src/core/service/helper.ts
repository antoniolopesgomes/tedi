import { ServiceError } from "./shared";

const METADATA_KEY = "tedi:service";

export interface ServiceMetadata {
    className: string;
}

export class ServiceHelper {

    setMetadata(target: Object, metadata: ServiceMetadata): void {
        Reflect.defineMetadata(METADATA_KEY, metadata, target);
    }

    getMetadata(target: Object): ServiceMetadata {
        return Reflect.getMetadata(METADATA_KEY, target);
    }

    validateInstance(instance: any): void {
        // check if instance class has valid metadata
        if (!this.getMetadata((<Object> instance).constructor)) {
            throw new ServiceError(instance, "must be decorated with @Filter");
        }
    }
}
