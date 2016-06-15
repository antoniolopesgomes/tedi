import * as _ from 'lodash';
import {Router, RouteDefinition, RouteAction, RouteFilter, RouteErrorHandler, ROUTE_KEYS} from '../core';
import {Server, injectable, inject} from '../../Server';
import {Filter, ErrorHandler} from '../../core';
import {Module} from '../../modules';
import {Logger} from '../../logging';

@injectable()
export class ExpressoRouter extends Router {

    private _routesDefinition: any;
    private _root: RouteDefinition;
    private _routingTable: Map<string, RouteDefinition>;
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

    getRoot(): RouteDefinition {
        return this._root;
    }

    getPathRoute(path: string): RouteDefinition {
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

    getRoutesConfiguration(routesDefinition: any): RouteDefinition {
        //create and setup root (add filters and errorHandlers)
        let root = new RouteDefinition('/');
        root.filters = this.getFilters(routesDefinition[ROUTE_KEYS.FILTERS]);
        root.errorHandlers = this.getErrorHandlers(routesDefinition[ROUTE_KEYS.ERROR_HANDLERS])
        //build routing tree
        this.buildRouteDefinition(root, routesDefinition);
        return root;
    }

    buildRouteDefinition(routeConfig: RouteDefinition, routes: any): void {
        Object.keys(routes).forEach((key: string) => {
            if (key.startsWith('/')) {
                let rawRouteDefinition = routes[key];
                //if we're deling with a module (string value)
                if (_.isString(rawRouteDefinition)) {
                    //load it
                    let module = Server.module(rawRouteDefinition);
                    //register modules components
                    module.registerComponents(Server);
                    //get the routerDefinition
                    rawRouteDefinition = module.getRawRouteDefinition();
                }
                let childRouteConfig = new RouteDefinition(key);
                routeConfig.children.push(childRouteConfig);
                this.fillRouteDefinition(rawRouteDefinition, childRouteConfig);
                this.buildRouteDefinition(childRouteConfig, rawRouteDefinition);
            }
            else if (['$filters', '$errorHandlers', 'get', 'post', 'put', 'delete'].indexOf(key) < 0) {
                this._logger.debug(`Routing key: '${key}', will be ignored`);
            }
        })
    }

    fillRouteDefinition(rawRouteDefinition: any, route: RouteDefinition): void {
        route.filters = this.getFilters(rawRouteDefinition[ROUTE_KEYS.FILTERS]);
        route.errorHandlers = this.getErrorHandlers(rawRouteDefinition[ROUTE_KEYS.ERROR_HANDLERS]);
        route.get = this.getAction(rawRouteDefinition.get);
        route.post = this.getAction(rawRouteDefinition.post);
        route.delete = this.getAction(rawRouteDefinition.delete);
        route.put = this.getAction(rawRouteDefinition.put);
    }

    getAction(routeAction: string[]): RouteAction {

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

    getRoutingTable(route: RouteDefinition): Map<string, RouteDefinition> {
        let routingTable = new Map<string, RouteDefinition>();
        let currentPath = '';
        this.setRoutingTableForRoute(currentPath, route, routingTable);
        return routingTable;
    }

    setRoutingTableForRoute(currentPath: string, route: RouteDefinition, routingTable: Map<string, RouteDefinition>) {
        currentPath += route.path;
        //remove double slashes
        currentPath = currentPath.replace('//', '/');
        routingTable.set(currentPath, route);
        route.children.forEach((childRoute: RouteDefinition) => {
            this.setRoutingTableForRoute(currentPath, childRoute, routingTable);
        });
    }
}

//ERRORS

function throwError(msg: string): void {
    throw new Error(`Router: ${msg}`);
}
