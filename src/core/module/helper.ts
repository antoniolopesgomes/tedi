import { Module } from "./shared";
import { ModuleError } from "./shared";
import { getClassName } from "../utils";

const METADATA_KEY = "tedi:module";

export interface ModuleMetadata {
    className: string;
}

export class ModuleHelper {

    setMetadata(target: Object, metadata: ModuleMetadata): void {
        Reflect.defineMetadata(METADATA_KEY, metadata, target);
    }

    getMetadata(target: Object): ModuleMetadata {
        return Reflect.getMetadata(METADATA_KEY, target);
    }

    validateInstance(instance: Module): void {
        // check if it was valid metadata
        if (!(instance instanceof Module)) {
            throw new ModuleError(instance, `must be an instance of ${getClassName(Module)}`);
        }
        if (!this.getMetadata((<Object>instance).constructor)) {
            throw new ModuleError(instance, "must be decorated with @Module");
        }
    }
}
