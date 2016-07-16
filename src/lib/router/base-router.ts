import * as _ from 'lodash';
import {
    Router,
    RouterError,
    Route,
    RouteError,
    RouteAction,
    RouteFilter,
    RouteErrorHandler,
    ROUTE_KEYS,
} from './core';
import {BaseRoute} from './base-route';
import {BaseFilter} from '../filter';
import {CustomError} from '../core';
import {Service} from '../service';
import {BaseErrorHandler} from '../error-handler';
import {Logger} from '../logger';
import {BaseModule, Module} from '../module';
import {inject} from '../di';

@Service()
export class BaseRouter implements Router {

    constructor(
        @inject('Logger') private _logger: Logger
    ) {}

    getRootRoute(jsonRoutes: any, module: BaseModule): Route {
        return parseJsonRoute('/', jsonRoutes, module);
    }

}

function parseJsonRoute(path: string, jsonRoute: any, module: BaseModule): Route {
    let route: Route = new BaseRoute(path);
    try {
        route.filters = parseRouteFilters(jsonRoute[ROUTE_KEYS.FILTERS], module);
        route.errorHandlers = parseRouteErrorHandlers(jsonRoute[ROUTE_KEYS.ERROR_HANDLERS], module);
        route.get = parseRouteAction(jsonRoute.get, module);
        route.post = parseRouteAction(jsonRoute.post, module);
        route.delete = parseRouteAction(jsonRoute.delete, module);
        route.put = parseRouteAction(jsonRoute.put, module);
        route.children = parseChildrenRoutes(jsonRoute, route, module);
    }
    catch (error) {
        throw new RouteError(route, 'Error parsing route', error);
    }
    return route;
}

function parseRouteAction(routeAction: string[], module: BaseModule): RouteAction {
    if (!routeAction) {
        return undefined;
    }
    if (!_.isArray(routeAction) || routeAction.length < 2) {
        throw new Error('parseRouteAction: action should have two string fields [controller, controllerMethod]');
    }

    let controllerName = routeAction[0];
    let methodName = routeAction[1];
    let controller: any = module.controller(controllerName);

    if (!_.isFunction(controller[methodName])) {
        throw new Error(`parseRouteAction: invalid controller[${controllerName}] method[${methodName}]`);
    }

    return {
        controller: controller,
        controllerMethod: methodName
    }
}

function parseRouteFilters(filterNames: string[], module: BaseModule): RouteFilter[] {

    function validateFilter(name: string, filter: BaseFilter<any>) {
        let hasFilterInterface = _.isFunction(filter.apply) && _.isFunction(filter.getDataFromRequest);
        if (!hasFilterInterface) {
            throw new Error(`parseRouteFilter: '${name}' must implement 'Filter'`);
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

function parseRouteErrorHandlers(errorHandlersNames: string[], module: BaseModule): RouteErrorHandler[] {

    function validateErrorHandler(name: string, errorHandler: BaseErrorHandler) {
        let hasErrorHandlerInterface = _.isFunction(errorHandler.catch);
        if (!hasErrorHandlerInterface) {
            throw new Error(`parseRouteErrorHandlers: '${name}' must implement 'ErrorHandler'`);
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

function parseChildrenRoutes(jsonRoute: any, route: Route, module: BaseModule): Route[] {
    let childrenRoutes: Route[] = [];
    Object.keys(jsonRoute).forEach((key: string) => {
        //all endpoints definitions begin with a slash
        if (key.indexOf('/') === 0) {
            let childJsonRoute = jsonRoute[key];
            //if we're deling with a module (string value)
            if (_.isString(childJsonRoute)) {
                //load it
                module = module.childModule(childJsonRoute);
                //get the routerDefinition
                childJsonRoute = module.getJsonRoutes();
            }
            //build child router
            let childRoutePath = normalizePath(route.path + key);
            let childRoute = parseJsonRoute(childRoutePath, childJsonRoute, module);
            childrenRoutes.push(childRoute);
        }
        else if (['$filters', '$errorHandlers', 'get', 'post', 'put', 'delete'].indexOf(key) < 0) {
            //this._logger.debug(`Routing key: '${key}' of ${route.path}, will be ignored`);
        }
    });
    return childrenRoutes;
}

//UTILS
function normalizePath(path: string): string {
    return path.replace('//', '/');
}