"use strict";
import { Filter } from "./filter";
import { ErrorHandler } from "./error-handler";
import { Module } from "./module";
import { TediError } from "./tedi-error";
import { HttpMethods } from "./utils";

export interface RouteAction {
    controller: Object;
    controllerMethod: string;
}

export interface RouteActions extends HttpMethods<RouteAction> { }

export const ROUTE_ACTIONS_BUILDER = "ROUTE_ACTIONS_BUILDER";

export interface RouteActionsBuilder {
    build(jsonRoute: any, module: Module): RouteActions;
}

export interface RouteFilter {
    token: any;
    filter: Filter<any>;
}

export interface RouteErrorHandler {
    token: any;
    errorHandler: ErrorHandler;
}

export interface Route {
    path: string;
    filters: RouteFilter[];
    errorHandlers: RouteErrorHandler[];
    actions: RouteActions;
    children: Route[];
}

export const ROUTER = "ROUTER";

export interface Router {
    getRootRoute(jsonRoutes: any, module: Module): Route;
}

export class RouteError extends TediError {
    constructor(route: Route, msg: string, error?: any) {
        super(`"${route.path}": ${msg}`, error);
    }
}

export class RouterError extends TediError {
    constructor(msg: string, error?: any) {
        super(`${msg}`, error);
    }
}
