import { Router, Route } from "./core";
import { Logger } from "../logger";
import { BaseModule } from "../module";
export declare class BaseRouter implements Router {
    private logger;
    constructor(logger: Logger);
    getRootRoute(jsonRoutes: any, module: BaseModule): Route;
    private _parseJsonRoute(path, jsonRoute, module);
    private _parseRouteAction(method, jsonRoute, module);
    private _parseRouteActionFromArray(method, jsonRoute, module);
    private _parseRouteActionFromController(method, jsonRoute, module);
    private _parseRouteFilters(filterNames, module);
    private _parseRouteErrorHandlers(errorHandlersNames, module);
    private _parseModuleRoute(path, module);
    private _isModule(jsonRouteValue);
    private _parseChildrenRoutes(jsonRoute, route, module);
}
