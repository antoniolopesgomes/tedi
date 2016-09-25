export * from "./service";
export * from "./controller";
export * from "./di";
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

// DECORATORS

import {Controller, ControllerDecorator} from "./controller/decorator";
import {Filter} from "./filter/decorator";
import {ErrorHandler} from "./error-handler/decorator";
import {Service} from "./service/decorator";
import {Module} from "./module/decorator";

export const tedi = {
    controller: Controller,
    filter: Filter,
    errorHandler: ErrorHandler,
    service: Service,
    module: Module,
};
