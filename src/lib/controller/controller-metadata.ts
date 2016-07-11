import * as METADATA_KEYS from '../constants/metadata-keys';

export class ControllerMetadata {
    static isPresent(target: Object): boolean {
        return Reflect.hasMetadata(METADATA_KEYS.CONTROLLER, target);
    }
    static actionMethodName(action: string, target: Object): string {
        return <string> Reflect.getMetadata(METADATA_KEYS[action.toUpperCase()], target);
    }
    static GETMethodName(target: Object): string {
        return this.actionMethodName('GET', target);
    }
    static POSTMethodName(target: Object): string {
        return this.actionMethodName('POST', target);
    }
    static DELETEMethodName(target: Object): string {
        return this.actionMethodName('DELETE', target);
    }
    static PUTMethodName(target: Object): string {
        return this.actionMethodName('PUT', target);
    }
}