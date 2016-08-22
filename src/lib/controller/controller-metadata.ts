import * as METADATA_KEYS from "../constants/metadata-keys";

export interface ControllerActionMetadata {
    name: string;
}

export class ControllerMetadata {
    public static isDecorated(target: Object): boolean {
        return Reflect.hasMetadata(METADATA_KEYS.CONTROLLER, target);
    }
    public static actionMethodName(action: string, target: Object): string {
        return <string> Reflect.getMetadata(METADATA_KEYS[action.toUpperCase()], target);
    }
    public static GET(target: Object): ControllerActionMetadata {
        return {
            name: this.actionMethodName("GET", target),
        };
    }
    public static POST(target: Object): ControllerActionMetadata {
        return {
            name: this.actionMethodName("POST", target),
        };
    }
    public static DELETE(target: Object): ControllerActionMetadata {
        return {
            name: this.actionMethodName("DELETE", target),
        };
    }
    public static PUT(target: Object): ControllerActionMetadata {
        return {
            name: this.actionMethodName("PUT", target),
        };
    }
}
