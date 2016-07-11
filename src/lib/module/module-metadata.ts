import * as METADATA_KEYS from '../constants/metadata-keys';

export class ModuleMetadata {
    static isDecorated(target: Object): boolean {
        return Reflect.hasMetadata(METADATA_KEYS.MODULE, target);
    }
}