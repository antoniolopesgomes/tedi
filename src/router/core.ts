'use strict';
import {
    Filter,
    ErrorHandler
} from '../core';

export interface RouteAction {
    controller: Object;
    controllerMethod: string;
}

export interface RouteFilter {
    name: string;
    filter: Filter<any>;
}

export interface RouteErrorHandler {
    name: string;
    errorHandler: ErrorHandler;
}

export class RouteDefinition {
    path: string;
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

export abstract class Router {
    abstract getRouterRoot(): RouteDefinition;
    abstract getPathRoute(path: string): RouteDefinition;
    abstract getPathAction(path: string, method: string): RouteAction;
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