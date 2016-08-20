import * as METADATA_KEYS from '../constants/metadata-keys';

export interface ControllerActionMetadata {
    name: string;
}

export class ControllerMetadata {
    static isDecorated(target: Object): boolean {
        return Reflect.hasMetadata(METADATA_KEYS.CONTROLLER, target);
    }
    static actionMethodName(action: string, target: Object): string {
        return <string> Reflect.getMetadata(METADATA_KEYS[action.toUpperCase()], target);
    }
    static GET(target: Object): ControllerActionMetadata {
        return {
            name: this.actionMethodName('GET', target)
        };
    }
    static POST(target: Object): ControllerActionMetadata {
        return {
            name: this.actionMethodName('POST', target)
        };
    }
    static DELETE(target: Object): ControllerActionMetadata {
        return {
            name: this.actionMethodName('DELETE', target)
        };
    }
    static PUT(target: Object): ControllerActionMetadata {
        return {
            name: this.actionMethodName('PUT', target)
        };
    }
}