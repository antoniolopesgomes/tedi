import { ModuleError } from "./core";
import { getClassName } from "../core/utils";
import { BaseModule } from "./base-module";
import { getMetadata } from "./decorator";

export function validateInstance(instance: BaseModule): void {
    // check if it was valid metadata
    if (!(instance instanceof BaseModule)) {
        throw new ModuleError(instance, `must be an instance of ${getClassName(BaseModule)}`);
    }
    if (!getMetadata((<Object> instance).constructor)) {
        throw new ModuleError(instance, "must be decorated with @Module");
    }
}
