import * as _ from 'lodash';
import {
    Router,
    RouteDefinition,
    RouteAction,
    RouteFilter,
    RouteErrorHandler,
    ROUTE_KEYS,
} from './core';
import {BaseFilter} from '../filter';
import {BaseErrorHandler} from '../error-handler';
import {Logger} from '../logger';
import {TediModule} from '../module';
import {inject, injectable} from '../di';

@injectable()
export class DefaultRouter implements Router {

    private _routesDefinition: any;
    private _root: RouteDefinition;
    private _routingTable: {[key: string]: RouteDefinition};
    private _routeBuilder: RouteBuilder;
    private _routingTableBuilder: RoutingTableBuilder;

    constructor(
        @inject('RoutesDefinition') routesDefinition: any,
        @inject('Server') serverModule: TediModule,
        @inject('Logger') logger: Logger
    ) {
        this._routesDefinition = routesDefinition;
        this._routeBuilder = new RouteBuilder(logger);
        this._routingTableBuilder = new RoutingTableBuilder(logger);
        //BUILD
        this._root = this._routeBuilder.getRoutesConfiguration(this._routesDefinition, serverModule);
        this._routingTable = this._routingTableBuilder.getRoutingTable(this._root);
    }

    getRouterRoot(): RouteDefinition {
        return this._root;
    }

    getPathRoute(path: string): RouteDefinition {
        let route = this._routingTable[path];
        return route || null;
    }

    getPathAction(path: string, method: string): RouteAction {
        let route = this._routingTable[path];
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

    getRoutesConfiguration(routesDefinition: any, module: TediModule): RouteDefinition {
        //create and setup root (add filters and errorHandlers)
        let root = new RouteDefinition('/');
        //root fullPath is equal to path
        root.fullPath = root.path;
        //root RouteDefinition only has Filters and ErrorHandlers
        root.filters = this.getFilters(routesDefinition[ROUTE_KEYS.FILTERS], module);
        root.errorHandlers = this.getErrorHandlers(routesDefinition[ROUTE_KEYS.ERROR_HANDLERS], module)
        //build routing tree
        this.buildRouteDefinition(routesDefinition, root, module);
        return root;
    }

    buildRouteDefinition(routes: any, routeConfig: RouteDefinition, module: TediModule): void {
        Object.keys(routes).forEach((key: string) => {
            if (key.indexOf('/') === 0) {
                let rawRouteDefinition = routes[key];
                //if we're deling with a module (string value)
                if (_.isString(rawRouteDefinition)) {
                    //load it
                    module = module.childModule(rawRouteDefinition);
                    //get the routerDefinition
                    rawRouteDefinition = module.getRoutes();
                }
                let childRouteConfig = new RouteDefinition(key);
                childRouteConfig.fullPath = normalizePath(routeConfig.fullPath + key);
                this.fillRouteDefinition(rawRouteDefinition, childRouteConfig, module);
                this.buildRouteDefinition(rawRouteDefinition, childRouteConfig, module);
                routeConfig.children.push(childRouteConfig);
            }
            else if (['$filters', '$errorHandlers', 'get', 'post', 'put', 'delete'].indexOf(key) < 0) {
                this._logger.debug(`Routing key: '${key}' of ${routeConfig.path}, will be ignored`);
            }
        })
    }

    fillRouteDefinition(rawRouteDefinition: any, route: RouteDefinition, module: TediModule): void {
        route.filters = this.getFilters(rawRouteDefinition[ROUTE_KEYS.FILTERS], module);
        route.errorHandlers = this.getErrorHandlers(rawRouteDefinition[ROUTE_KEYS.ERROR_HANDLERS], module);
        route.get = this.getAction(rawRouteDefinition.get, module);
        route.post = this.getAction(rawRouteDefinition.post, module);
        route.delete = this.getAction(rawRouteDefinition.delete, module);
        route.put = this.getAction(rawRouteDefinition.put, module);
    }

    getAction(routeAction: string[], module: TediModule): RouteAction {

        if (!routeAction) {
            return undefined;
        }

        if (!_.isArray(routeAction) || routeAction.length < 2) {
            throwError('action should have two string fields [controller, controllerMethod]');
        }

        let controllerName = routeAction[0];
        let methodName = routeAction[1];

        let controller: any = module.controller(controllerName);
        if (!_.isFunction(controller[methodName])) {
            throwError(`invalid controller[${controllerName}] method[${methodName}]`);
        }

        return {
            controller: controller,
            controllerMethod: methodName
        }
    }

    getFilters(filterNames: string[], module: TediModule): RouteFilter[] {

        function validateFilter(name: string, filter: BaseFilter<any>) {
            let hasFilterInterface = _.isFunction(filter.apply) && _.isFunction(filter.getDataFromRequest);
            if (!hasFilterInterface) {
                throwError(`'${name}' must implement 'Filter'`);
            }
        }

        if (!_.isArray(filterNames)) {
            return [];
        }

        return filterNames.map<RouteFilter>((name: string) => {
            let filter = module.filter(name);
            validateFilter(name, filter);
            return <RouteFilter>{
                name: name,
                filter: filter
            }
        });

    }

    getErrorHandlers(errorHandlersNames: string[], module: TediModule): RouteErrorHandler[] {

        function validateErrorHandler(name: string, errorHandler: BaseErrorHandler) {
            let hasErrorHandlerInterface = _.isFunction(errorHandler.catch);
            if (!hasErrorHandlerInterface) {
                throwError(`'${name}' must implement 'ErrorHandler'`);
            }
        }

        if (!_.isArray(errorHandlersNames)) {
            return [];
        }

        return errorHandlersNames.map<RouteErrorHandler>((name: string) => {
            let errorHandler = module.errorHandler(name);
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

    getRoutingTable(route: RouteDefinition): {[key: string]: RouteDefinition} {
        let routingTable: {[key: string]: RouteDefinition} = {};
        let currentPath = '';
        this.setRoutingTableForRoute(currentPath, route, routingTable);
        return routingTable;
    }

    setRoutingTableForRoute(currentPath: string, route: RouteDefinition, routingTable: {[key: string]: RouteDefinition}) {
        currentPath += route.path;
        //remove double slashes
        currentPath = normalizePath(currentPath);
        routingTable[currentPath] = route;
        route.children.forEach((childRoute: RouteDefinition) => {
            this.setRoutingTableForRoute(currentPath, childRoute, routingTable);
        });
    }
}

//UTILS
function normalizePath(path: string): string {
    return path.replace('//', '/');
}

//ERRORS

function throwError(msg: string): void {
    throw new Error(`Router: ${msg}`);
}
