import * as _ from 'lodash';
import {Router, Route, RouteAction, RouteFilter, RouteErrorHandler, ROUTE_KEYS} from '../core';
import {Server, injectable, inject} from '../../Server';
import {Filter, ErrorHandler} from '../../core';
import {Logger} from '../../logging';

@injectable()
export class ExpressoRouter extends Router {

    private _routesDefinition: any;
    private _root: Route;
    private _routingTable: Map<string, Route>;
    private _routeBuilder: RouteBuilder;
    private _routingTableBuilder: RoutingTableBuilder;

    constructor(
        @inject('RoutesDefinition') routesDefinition: any,
        logger: Logger
    ) {
        super();
        this._routesDefinition = routesDefinition;
        this._routeBuilder = new RouteBuilder(logger);
        this._routingTableBuilder = new RoutingTableBuilder(logger);
        //build elements
        this._build();
    }

    private _build(): void {
        this._root = this._routeBuilder.getRoutesConfiguration(this._routesDefinition);
        this._routingTable = this._routingTableBuilder.getRoutingTable(this._root);
    }

    getRoot(): Route {
        return this._root;
    }

    getPathRoute(path: string): Route {
        let route = this._routingTable.get(path);
        return route || null;
    }

    getPathAction(path: string, method: string): RouteAction {
        let route = this._routingTable.get(path);
        if (!route) {
            return null;
        }
        method = (method || '').toLowerCase();
        let routeAction = <RouteAction>route[method];
        return routeAction || null;
    }
}

//HELPERS

export class RouteBuilder {

    constructor(
        private _logger: Logger
    ) { }

    getRoutesConfiguration(routesDefinition: any): Route {
        //create and setup root (add filters and errorHandlers)
        let root = new Route('/');
        root.filters = this.getFilters(routesDefinition[ROUTE_KEYS.FILTERS]);
        root.errorHandlers = this.getErrorHandlers(routesDefinition[ROUTE_KEYS.ERROR_HANDLERS])
        //build routing tree
        this.buildRouteConfig(root, routesDefinition);
        return root;
    }

    buildRouteConfig(routeConfig: Route, routes: any): void {
        Object.keys(routes).forEach((key: string) => {
            if (key.startsWith('/')) {
                let childRouteConfig = new Route(key);
                routeConfig.children.push(childRouteConfig);
                this.fillRoute(routes[key], childRouteConfig);
                this.buildRouteConfig(childRouteConfig, routes[key]);
            }
            else if (['$filters', '$errorHandlers', 'get', 'post', 'put', 'delete'].indexOf(key) < 0) {

            }
        })
    }

    fillRoute(routeConfig: any, route: Route): void {
        route.filters = this.getFilters(routeConfig[ROUTE_KEYS.FILTERS]);
        route.errorHandlers = this.getErrorHandlers(routeConfig[ROUTE_KEYS.ERROR_HANDLERS]);
        route.get = this.getRouteAction(routeConfig.get);
        route.post = this.getRouteAction(routeConfig.post);
        route.delete = this.getRouteAction(routeConfig.delete);
        route.put = this.getRouteAction(routeConfig.put);
    }

    getRouteAction(routeAction: string[]): RouteAction {

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

    getFilters(filterNames: string[]): RouteFilter[] {

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
            return <RouteFilter>{
                name: name,
                filter: filter
            }
        });

    }

    getErrorHandlers(errorHandlersNames: string[]): RouteErrorHandler[] {

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
            return <RouteErrorHandler>{
                name: name,
                errorHandler: errorHandler
            };
        });

    }

}

export class RoutingTableBuilder {

    constructor(
        private _logger: Logger
    ) { }

    getRoutingTable(route: Route): Map<string, Route> {
        let routingTable = new Map<string, Route>();
        let currentPath = '';
        this.setRoutingTableForRoute(currentPath, route, routingTable);
        return routingTable;
    }

    setRoutingTableForRoute(currentPath: string, route: Route, routingTable: Map<string, Route>) {
        currentPath += route.path;
        //remove double slashes
        currentPath = currentPath.replace('//', '/');
        routingTable.set(currentPath, route);
        route.children.forEach((childRoute: Route) => {
            this.setRoutingTableForRoute(currentPath, childRoute, routingTable);
        });
    }
}

//ERRORS

function throwError(msg: string): void {
    throw new Error(`CoreRouter: ${msg}`);
}
