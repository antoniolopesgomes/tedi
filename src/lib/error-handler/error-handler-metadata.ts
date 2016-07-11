import * as METADATA_KEYS from '../constants/metadata-keys';

export class ErrorHandlerMetadata {
    static isPresent(target: Object): boolean {
        return Reflect.hasMetadata(METADATA_KEYS.ERROR_HANDLER, target);
    }
}