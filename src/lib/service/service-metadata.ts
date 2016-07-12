import * as METADATA_KEYS from '../constants/metadata-keys';

export class ServiceMetadata {
    static isDecorated(target: Object): boolean {
        return Reflect.hasMetadata(METADATA_KEYS.SERVICE, target);
    }
}