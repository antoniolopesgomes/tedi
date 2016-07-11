import * as METADATA_KEYS from '../constants/metadata-keys';

export class FilterMetadata {
    static isPresent(target: Object): boolean {
        return Reflect.hasMetadata(METADATA_KEYS.FILTER, target);
    }
}