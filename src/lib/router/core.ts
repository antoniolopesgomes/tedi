'use strict';
import {BaseFilter} from '../filter';
import {BaseErrorHandler} from '../error-handler';

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

export class RouteDefinition {
    path: string;
    fullPath: string;
    filters: RouteFilter[];
    errorHandlers: RouteErrorHandler[];
    children: RouteDefinition[];
    //actions
    get: RouteAction;
    post: RouteAction;
    delete: RouteAction;
    put: RouteAction;
    //data
    data: any;

    constructor(path: string) {
        this.path = path;
        this.filters = [];
        this.errorHandlers = [];
        this.children = [];
        this.data = {};
    }
}

export interface Router {
    getRouterRoot(): RouteDefinition;
    getPathRoute(path: string): RouteDefinition;
    getPathAction(path: string, method: string): RouteAction;
}

export interface RoutesDefinition {

}

export const ROUTE_KEYS: any = {
    'FILTERS': '$filters',
    'ERROR_HANDLERS': '$errorHandlers'
}

function throwError(message: string): void {
    throw new Error(`Router: ${message}`);
}