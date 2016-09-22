import {getClassName} from "../core/utils";
import {ServiceMetadata, ServiceMetadataDescriptor} from "../service";

const ERROR_HANDLER_METADATA_KEY = "tedi:errorHandler";

export interface ErrorHandlerMetadataDescriptor {
    service: ServiceMetadataDescriptor;
}

export class ErrorHandlerMetadata {

    public static setMetadata(target: Object): void {
        let className = getClassName(target);
        if (this.getMetadata(target)) {
            throw new Error(`ErrorHandler metadata for target ${className} already exists`);
        }
        let errorHandlerMetadata = <ErrorHandlerMetadataDescriptor> {
            service: ServiceMetadata.getMetadata(target),
        };
        Reflect.defineMetadata(ERROR_HANDLER_METADATA_KEY, errorHandlerMetadata, target);
    }

    public static getMetadata(target: Object): ErrorHandlerMetadataDescriptor {
        return <ErrorHandlerMetadataDescriptor> Reflect.getMetadata(ERROR_HANDLER_METADATA_KEY, target);
    }
}
