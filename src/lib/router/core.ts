'use strict';
import {BaseFilter} from '../filter';
import {BaseErrorHandler} from '../error-handler';
import {BaseModule} from '../module';
import {CustomError} from '../core';

export enum RouteMethod {
    GET,
    POST,
    PUT,
    DELETE
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
    //actions
    get: RouteAction;
    post: RouteAction;
    delete: RouteAction;
    put: RouteAction;
}

export class RouteError extends CustomError {
    constructor(route: Route, msg: string, error?: any) {
        super(`'${route.path}': ${msg}`, error);
    }
}

export interface Router {
    getRootRoute(jsonRoutes: any, module: BaseModule): Route;
}

export class RouterError extends CustomError {
    constructor(msg: string, error?: any) {
        super(`${msg}`, error);
    }
}

export interface RoutesDefinition {

}

function throwError(message: string): void {
    throw new Error(`Router: ${message}`);
}