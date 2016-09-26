"use strict";
import { Filter } from "./filter";
import { ErrorHandler } from "./error-handler";
import { Module } from "./module";
import { TediError } from "../core";
import { HttpMethods } from "../core/http";

export interface RouteAction {
    controller: Object;
    controllerMethod: string;
}

export interface RouteActions extends HttpMethods<RouteAction> { }

export interface RouteActionsBuilder {
    build(jsonRoute: any, module: Module): RouteActions;
}

export interface RouteFilter {
    name: string;
    filter: Filter<any>;
}

export interface RouteErrorHandler {
    name: string;
    errorHandler: ErrorHandler;
}

export interface Route {
    path: string;
    filters: RouteFilter[];
    errorHandlers: RouteErrorHandler[];
    actions: RouteActions;
    children: Route[];
}

export class RouteError extends TediError {
    constructor(route: Route, msg: string, error?: any) {
        super(`"${route.path}": ${msg}`, error);
    }
}

export interface Router {
    getRootRoute(jsonRoutes: any, module: Module): Route;
}

export class RouterError extends TediError {
    constructor(msg: string, error?: any) {
        super(`${msg}`, error);
    }
}