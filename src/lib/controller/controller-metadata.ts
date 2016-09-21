import {getClassName} from "../core/utils";

const CONTROLLER_METADATA_KEY = "tedi:controller";
const ACTIONS_METADATA_KEY = "tedi:action";

function getActionMetadataKey(httpMethodName: string) {
    return `${ACTIONS_METADATA_KEY}:${httpMethodName}`;
}

export interface ControllerMetadata {
    className: string;
};

export interface ActionMetadata {
    methodName: string;
}

export class ControllerMetadataManager {

    public static setControllerMetadata(target: Object): void {
        let className = getClassName(target);
        if (this.getControllerMetadata(target)) {
            throw new Error(`Metadata for ${className} already exists`);
        }
        let controllerMetadata = <ControllerMetadata> {
            className: className,
        };
        Reflect.defineMetadata(CONTROLLER_METADATA_KEY, controllerMetadata, target);
    }

    public static getControllerMetadata(target: Object): ControllerMetadata {
        return <ControllerMetadata> Reflect.getMetadata(CONTROLLER_METADATA_KEY, target);
    }

    public static setActionMetadata(httpMethodName: string, targetMethodName: string, target: Object): void {
        if (this.getActionMetadata(httpMethodName, target)) {
            throw new Error(`Metadata for '${httpMethodName}' already exists`);
        }
        let actionMetadata = <ActionMetadata> {
            methodName: targetMethodName,
        };
        Reflect.defineMetadata(getActionMetadataKey(httpMethodName), actionMetadata, target);
    }

    public static getActionMetadata(httpMethodName: string, target: Object): ActionMetadata {
        return <ActionMetadata> Reflect.getMetadata(getActionMetadataKey(httpMethodName), target);
    }

}
