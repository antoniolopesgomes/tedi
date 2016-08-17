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
import {BaseFilter, FilterValidator} from '../filter';
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
    ) { }

    getRootRoute(jsonRoutes: any, module: BaseModule): Route {
        return this._parseJsonRoute('/', jsonRoutes, module);
    }

    private _parseJsonRoute(path: string, jsonRoute: any, module: BaseModule): Route {
        let route: Route = new BaseRoute(path);
        try {
            route.filters = this._parseRouteFilters(jsonRoute[ROUTE_KEYS.FILTERS], module);
            route.errorHandlers = this._parseRouteErrorHandlers(jsonRoute[ROUTE_KEYS.ERROR_HANDLERS], module);
            route.get = this._parseRouteAction(jsonRoute.get, module);
            route.post = this._parseRouteAction(jsonRoute.post, module);
            route.delete = this._parseRouteAction(jsonRoute.delete, module);
            route.put = this._parseRouteAction(jsonRoute.put, module);
            route.children = this._parseChildrenRoutes(jsonRoute, route, module);
        }
        catch (error) {
            throw new RouteError(route, 'Error parsing route', error);
        }
        return route;
    }

    private _parseRouteAction(routeAction: string[], module: BaseModule): RouteAction {
        if (!routeAction) {
            return undefined;
        }
        if (!_.isArray(routeAction) || routeAction.length < 2) {
            throw new Error('parseRouteAction: action should have two string fields [controller, controllerMethod]');
        }

        let controllerName = routeAction[0];
        let methodName = routeAction[1];
        let controller: any = module.getDependency(controllerName);

        if (!_.isFunction(controller[methodName])) {
            throw new Error(`parseRouteAction: invalid controller[${controllerName}] method[${methodName}]`);
        }

        return {
            controller: controller,
            controllerMethod: methodName
        }
    }

    private _parseRouteFilters(filterNames: string[], module: BaseModule): RouteFilter[] {

        if (!_.isArray(filterNames)) {
            return [];
        }

        return filterNames.map<RouteFilter>((name: string) => {
            let filter = module.getDependency<BaseFilter<any>>(name);
            try {
                FilterValidator.validate(filter);
            }
            catch (e) {
                throw new RouterError(`Could not validate filter '${name}'`, e);
            }
            return <RouteFilter>{
                name: name,
                filter: filter
            }
        });
    }

    private _parseRouteErrorHandlers(errorHandlersNames: string[], module: BaseModule): RouteErrorHandler[] {

        function validateErrorHandler(name: string, errorHandler: BaseErrorHandler) {
            let hasErrorHandlerInterface = _.isFunction(errorHandler.catch);
            if (!hasErrorHandlerInterface) {
                throw new Error(`parseRouteErrorHandlers: '${name}' must implement 'BaseErrorHandler'`);
            }
        }

        if (!_.isArray(errorHandlersNames)) {
            return [];
        }

        return errorHandlersNames.map<RouteErrorHandler>((name: string) => {
            let errorHandler = module.getDependency<BaseErrorHandler>(name);
            validateErrorHandler(name, errorHandler);
            return <RouteErrorHandler>{
                name: name,
                errorHandler: errorHandler
            };
        });
    }

    private _parseModuleRoute(path: string, module: BaseModule): Route {

        function validateModule(aModule: BaseModule): void {

        }

        validateModule(module);

        return this._parseJsonRoute(path, module.getJsonRoutes(), module);

    }

    private _isModule(jsonRouteValue: any): boolean {
        return _.isString(jsonRouteValue);
    }

    private _parseChildrenRoutes(jsonRoute: any, route: Route, module: BaseModule): Route[] {
        let childrenRoutes: Route[] = [];
        Object.keys(jsonRoute).forEach((key: string) => {
            //all endpoints definitions begin with a slash
            if (key.indexOf('/') === 0) {
                let childJsonRouteValue = jsonRoute[key];
                let childRoutePath = normalizePath(route.path + key);
                let childRoute: Route;
                //if we're deling with a module (string value)
                if (this._isModule(childJsonRouteValue)) {
                    childRoute = this._parseModuleRoute(childRoutePath, module.getDependency<BaseModule>(childJsonRouteValue))
                }
                else {
                    childRoute = this._parseJsonRoute(childRoutePath, childJsonRouteValue, module);
                }
                childrenRoutes.push(childRoute);
            }
            else if (['$filters', '$errorHandlers', 'get', 'post', 'put', 'delete'].indexOf(key) < 0) {
                this._logger.debug(`Routing key: '${key}' of ${route.path}, will be ignored`);
            }
        });
        return childrenRoutes;
    }

}

//UTILS
function normalizePath(path: string): string {
    return path.replace('//', '/');
}