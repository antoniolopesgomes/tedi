import * as METADATA_KEYS from '../constants/metadata-keys';

export class DependencyMetadata {
    static isDecorated(target: Object): boolean {
        return Reflect.hasMetadata(METADATA_KEYS.DEPENDENCY, target);
    }
}