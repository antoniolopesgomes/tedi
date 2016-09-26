export * from "./service";
export * from "./controller";
export * from "./error-handler";
export * from "./filter";
export * from "./module";
export * from "./config";
export * from "./errors";
export * from "./http";
export * from "./logger";
export * from "./router";
export * from "./promises";
export * from "./errors";
export * from "./interfaces";
export * from "./utils";
export * from "./di";

// DECORATORS

import { ControllerDecorator } from "./controller/decorator";
import { FilterDecorator } from "./filter/decorator";
import { ErrorHandlerDecorator } from "./error-handler/decorator";
import { ServiceDecorator } from "./service/decorator";
import { ModuleDecorator } from "./module/decorator";
import { InjectDecorator } from "./di/decorators";
import { DIToken } from "./di/shared";

export const tedi = {
    controller: ControllerDecorator,
    filter: FilterDecorator,
    errorHandler: ErrorHandlerDecorator,
    service: ServiceDecorator,
    module: ModuleDecorator,
    inject: InjectDecorator,
};
