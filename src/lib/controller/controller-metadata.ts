import * as METADATA_KEYS from "../constants/metadata-keys";

export interface ControllerActionMetadata {
    name: string;
}

export class ControllerMetadata {
    public static isDecoratedWithController(target: Object): boolean {
        return Reflect.hasMetadata(METADATA_KEYS.CONTROLLER, target);
    }
    public static isDecoratedWithHttpMethod(httpMethodName: string, target: Object): boolean {
        return Reflect.hasMetadata(httpMethodName, target);
    }
    public static decorateWithHttpMethod(httpMethodName: string, propertyKey: string, target: Object): void {
        Reflect.defineMetadata(httpMethodName, propertyKey, target);
    }
    public static getHttpMethodMetadata(httpMethodName: string, target: Object): ControllerActionMetadata {
        return {
            name: <string> Reflect.getMetadata(httpMethodName, target),
        };
    }
}
