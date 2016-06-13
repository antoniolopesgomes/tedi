import * as _ from 'lodash';
import {Router, Route, RouteAction, RouteFilter, RouteErrorHandler, ROUTE_KEYS} from '../core';
import {Server, injectable, inject} from '../../Server';
import {Filter, ErrorHandler} from '../../core';

@injectable()
export class ExpressoRouter extends Router {
    
    private _routesDefinition: any;
    
    constructor(@inject('RoutesDefinition') routesDefinition: any) {
        super();
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
    
    let controller: any = Server.controller(controllerName);
    if (!_.isFunction(controller[methodName])) {
        throwError(`invalid controller[${controllerName}] method[${methodName}]`);
    }
    
    return {
        controller: controller,
        controllerMethod: methodName
    }
}

function getFilters(filterNames: string[]): RouteFilter[] {
    
    function validateFilter(name: string, filter: any) {
        if (!(filter instanceof Filter)) {
            throwError(`'${name}' must extend from 'Filter'`);
        }
    }
        
    if (!_.isArray(filterNames)) {
        return [];
    }
    
    return filterNames.map<RouteFilter>((name: string) => {
        let filter = Server.filter(name);
        validateFilter(name, filter);
        return <RouteFilter> {
            name: name,
            filter: filter
        }
    });

}

function getErrorHandlers(errorHandlersNames: string[]): RouteErrorHandler[] {
    
    function validateErrorHandler(name: string, errorHandler: any) {
        if (!(errorHandler instanceof ErrorHandler)) {
            throwError(`'${name}' must extend from 'ErrorHandler'`);
        }
    }
        
    if (!_.isArray(errorHandlersNames)) {
        return [];
    }
    
    return errorHandlersNames.map<RouteErrorHandler>((name: string) => {
        let errorHandler = Server.errorHandler(name);
        validateErrorHandler(name, errorHandler);
        return <RouteErrorHandler> {
            name: name,
            errorHandler: errorHandler
        };
    });
    
}

function throwError(msg: string): void {
    throw new Error(`CoreRouter: ${msg}`);
}
