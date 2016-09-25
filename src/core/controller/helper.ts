import { ControllerError } from "./shared";

const METADATA_KEY = "tedi:controller";

export interface ControllerMetadata {
    className: string;
}

export interface ActionMetadata {
    className: string;
    methodName: string;
}

export interface ControllerMetadata {
    className: string;
}

function getActionMetadataKey(httpMethodName: string): string {
    return `${METADATA_KEY}:${httpMethodName}`;
}

export class ControllerHelper {

    setMetadata(target: Object, metadata: ControllerMetadata): void {
        Reflect.defineMetadata(METADATA_KEY, metadata, target);
    }

    getMetadata(target: Object): ControllerMetadata {
        return Reflect.getMetadata(METADATA_KEY, target);
    }

    setActionMetadata(httpMethodName: string, metadata: ActionMetadata, target: Object): void {
        Reflect.defineMetadata(getActionMetadataKey(httpMethodName), metadata, target);
    }
    getActionMetadata(httpMethodName: string, target: Object): ActionMetadata {
        return Reflect.getMetadata(getActionMetadataKey(httpMethodName), target);
    }

    validateInstance(instance: any): void {
        // check if it was valid metadata
        if (!this.getMetadata((<Object> instance).constructor)) {
            throw new ControllerError(instance, "invalid: must be decorated with @Controller");
        }
    }
}
