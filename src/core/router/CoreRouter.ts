import * as _ from 'lodash';
import {Router, Route, RouteAction, ROUTE_KEYS} from './index';
import {Global, injectable, inject} from '../Global';
import {Filter, ErrorHandler} from '../../core';

@injectable()
export class CoreRouter implements Router {
    
    private _routesDefinition: any;
    
    constructor(@inject('RoutesDefinition') routesDefinition: any) {
        this._routesDefinition = routesDefinition;
    }
    
    getRoutesConfiguration(): Route {
        //create and setup root (add filters and errorHandlers)
        let root = new Route('/');
        root.filters = getFilters(this._routesDefinition[ROUTE_KEYS.FILTERS]);
        root.errorHandlers = getErrorHandlers(this._routesDefinition[ROUTE_KEYS.ERROR_HANDLERS])
        //build routing tree
        buildRouteConfig(root, this._routesDefinition);
        return root;
    }
    
}

//HELPERS

function buildRouteConfig(routeConfig: Route, routes: any): void {
    Object.keys(routes).forEach((key: string) => {
        if (key.startsWith('/')) {
            let childRouteConfig = new Route(key);
            routeConfig.children.push(childRouteConfig);
            fillRoute(routes[key], childRouteConfig);
            buildRouteConfig(childRouteConfig, routes[key]);
        }
    })
}

function fillRoute(routeConfig: any, route: Route): void {
    route.filters = getFilters(routeConfig[ROUTE_KEYS.FILTERS]);
    route.errorHandlers = getErrorHandlers(routeConfig[ROUTE_KEYS.ERROR_HANDLERS]);
    route.get = getRouteAction(routeConfig.get);
    route.post = getRouteAction(routeConfig.post);
    route.delete = getRouteAction(routeConfig.delete);
    route.put = getRouteAction(routeConfig.put);
}

function getRouteAction(routeAction: string[]): RouteAction {
    
    if (!routeAction) {
        return undefined;
    }
    
    if (!_.isArray(routeAction) || routeAction.length < 2) {
        throwError('action should have two string fields [controller, controllerMethod]');
    }
    
    let controllerName = routeAction[0];
    let methodName = routeAction[1];
    
    let controller: any = Global.getController(controllerName);
    if (!_.isFunction(controller[methodName])) {
        throwError(`invalid controller[${controllerName}] method[${methodName}]`);
    }
    
    return {
        controller: controller,
        controllerMethod: methodName
    }
}

function getFilters(filterNames: string[]): any[] {
    
    function validateFilter(name: string, filter: any) {
        if (!(filter instanceof Filter)) {
            throwError(`'${name}' must extend from 'Filter'`);
        }
    }
    
    let filters: any[] = [];
    
    if (!_.isArray(filterNames)) {
        return filters;
    }
    
    filters = filterNames.map((name: string) => {
        let filter = Global.getFilter(name);
        validateFilter(name, filter);
        return filter;
    });
    
    return filters;
}

function getErrorHandlers(errorHandlersNames: string[]): any[] {
    
    function validateErrorHandler(name: string, errorHandler: any) {
        if (!(errorHandler instanceof ErrorHandler)) {
            throwError(`'${name}' must extend from 'ErrorHandler'`);
        }
    }
    
    let errorHandlers: any[] = [];
    
    if (!_.isArray(errorHandlersNames)) {
        return errorHandlers;
    }
    
    errorHandlers = errorHandlersNames.map((name: string) => {
        let errorHandler = Global.getErrorHandler(name);
        validateErrorHandler(name, errorHandler);
        return errorHandler;
    });
    
    return errorHandlers;
}

function throwError(msg: string): void {
    throw new Error(`CoreRouter: ${msg}`);
}
