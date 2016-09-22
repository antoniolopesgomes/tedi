import {getClassName} from "../core/utils";
import {ServiceMetadata, ServiceMetadataDescriptor} from "../service";

const CONTROLLER_METADATA_KEY = "tedi:controller";
const ACTIONS_METADATA_KEY = "tedi:action";

function getActionMetadataKey(httpMethodName: string) {
    return `${ACTIONS_METADATA_KEY}:${httpMethodName}`;
}

export interface ControllerMetadataDescriptor {
    service: ServiceMetadataDescriptor;
};

export interface ActionMetadataDescriptor {
    methodName: string;
}

export class ControllerMetadata {

    public static setMetadata(target: Object): void {
        let className = getClassName(target);
        if (this.getMetadata(target)) {
            throw new Error(`Controller metadata for target ${className} already exists`);
        }
        let controllerMetadata = <ControllerMetadataDescriptor> {
            service: ServiceMetadata.getMetadata(target),
        };
        Reflect.defineMetadata(CONTROLLER_METADATA_KEY, controllerMetadata, target);
    }

    public static getMetadata(target: Object): ControllerMetadataDescriptor {
        return <ControllerMetadataDescriptor> Reflect.getMetadata(CONTROLLER_METADATA_KEY, target);
    }

    public static setActionMetadata(httpMethodName: string, targetMethodName: string, target: Object): void {
        if (this.getActionMetadata(httpMethodName, target)) {
            throw new Error(`Action metadata for '${httpMethodName}' in target ${getClassName(target)} already exists`);
        }
        let actionMetadata = <ActionMetadataDescriptor> {
            methodName: targetMethodName,
        };
        Reflect.defineMetadata(getActionMetadataKey(httpMethodName), actionMetadata, target);
    }

    public static getActionMetadata(httpMethodName: string, target: Object): ActionMetadataDescriptor {
        return <ActionMetadataDescriptor> Reflect.getMetadata(getActionMetadataKey(httpMethodName), target);
    }

}
