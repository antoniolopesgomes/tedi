import { BaseFilter } from "../filter";
import { BaseErrorHandler } from "../error-handler";
import { BaseModule } from "../module";
import { CustomError } from "../core";
export declare enum RouteMethod {
    GET = 0,
    POST = 1,
    PUT = 2,
    DELETE = 3,
}
export interface RouteAction {
    controller: Object;
    controllerMethod: string;
}
export interface RouteFilter {
    name: string;
    filter: BaseFilter<any>;
}
export interface RouteErrorHandler {
    name: string;
    errorHandler: BaseErrorHandler;
}
export interface Route {
    path: string;
    filters: RouteFilter[];
    errorHandlers: RouteErrorHandler[];
    children: Route[];
    get: RouteAction;
    post: RouteAction;
    delete: RouteAction;
    put: RouteAction;
}
export declare class RouteError extends CustomError {
    constructor(route: Route, msg: string, error?: any);
}
export interface Router {
    getRootRoute(jsonRoutes: any, module: BaseModule): Route;
}
export declare class RouterError extends CustomError {
    constructor(msg: string, error?: any);
}
export interface RoutesDefinition {
}
