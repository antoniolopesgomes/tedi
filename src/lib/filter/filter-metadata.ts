import * as METADATA_KEYS from "../constants/metadata-keys";

export class FilterMetadata {
    public static isDecorated(target: Object): boolean {
        return Reflect.hasMetadata(METADATA_KEYS.FILTER, target);
    }
}
