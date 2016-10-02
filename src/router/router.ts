import * as _ from "lodash";

import {
    Logger,
    Router,
    RouteActionsBuilder,
    Module,
    Route,
    RouteFilter,
    RouteError,
    RouteErrorHandler,
    ErrorHandler,
    Filter,
    validateFilter, validateErrorHandler, validateModule,
} from "../core";

import { getClassName } from "../core/utils";
import { Injectable, Inject } from "../decorators";
import { TediRoute } from "./route";

const ROUTER_WORDS: any = {
    "FILTERS": "$filters",
    "ERROR_HANDLERS": "$errorHandlers",
};

@Injectable()
export class TediRouter implements Router {

    constructor(
        @Inject("Logger") private logger: Logger,
        @Inject("RouteActionsBuilder") private _routeActionsBuilder: RouteActionsBuilder
    ) { }

    public getRootRoute(jsonRoutes: any, module: Module): Route {
        return this._parseJsonRoute("/", jsonRoutes, module);
    }

    private _parseJsonRoute(path: string, jsonRoute: any, module: Module): Route {
        let route: Route = new TediRoute(path);

        route.filters = this._parseRouteFilters(route, jsonRoute[ROUTER_WORDS.FILTERS], module);
        route.errorHandlers = this._parseRouteErrorHandlers(route, jsonRoute[ROUTER_WORDS.ERROR_HANDLERS], module);
        route.actions = this._routeActionsBuilder.build(jsonRoute, module);
        route.children = this._parseChildrenRoutes(jsonRoute, route, module);

        return route;
    }

    private _parseRouteFilters(route: Route, filterNames: string[], module: Module): RouteFilter[] {

        if (!_.isArray(filterNames)) {
            return [];
        }

        return filterNames.map<RouteFilter>((name: string) => {
            let filter = module.getDependency<Filter<any>>(name);
            try {
                validateFilter(filter);
            } catch (error) {
                throw new RouteError(route, `Invalid filter: "${name}"`, error);
            }
            return <RouteFilter> {
                filter: filter,
                name: name,
            };
        });
    }

    private _parseRouteErrorHandlers(
        route: Route,
        errorHandlersNames: string[],
        module: Module
    ): RouteErrorHandler[] {

        if (!_.isArray(errorHandlersNames)) {
            return [];
        }

        return errorHandlersNames.map<RouteErrorHandler>((name: string) => {
            let errorHandler = module.getDependency<ErrorHandler>(name);
            try {
                validateErrorHandler(errorHandler);
            } catch (error) {
                throw new RouteError(route, `Could not validate errorHandler "${name}"`, error);
            }
            return <RouteErrorHandler> {
                errorHandler: errorHandler,
                name: name,
            };
        });
    }

    private _parseModuleRoute(route: Route, path: string, module: Module): Route {

        try {
            validateModule(module);
        } catch (error) {
            throw new RouteError(route, `Invalid module "${getClassName(module)}"`, error);
        }

        return this._parseJsonRoute(path, module.getJsonRoutes(), module);
    }

    private _isModule(jsonRouteValue: any): boolean {
        return _.isString(jsonRouteValue);
    }

    private _parseChildrenRoutes(jsonRoute: any, route: Route, module: Module): Route[] {
        let childrenRoutes: Route[] = [];
        Object.keys(jsonRoute).forEach((key: string) => {
            // all endpoints definitions begin with a slash
            if (key.indexOf("/") === 0) {
                let childJsonRouteValue = jsonRoute[key];
                let childRoutePath = normalizePath(route.path + key);
                let childRoute: Route;
                // if we"re deling with a module (string value)
                if (this._isModule(childJsonRouteValue)) {
                    let childModule = module.getDependency<Module>(childJsonRouteValue);
                    childRoute = this._parseModuleRoute(route, childRoutePath, childModule);
                } else {
                    childRoute = this._parseJsonRoute(childRoutePath, childJsonRouteValue, module);
                }
                childrenRoutes.push(childRoute);
            } else if ([...(_.values(ROUTER_WORDS)), "get", "post", "put", "delete"].indexOf(key) < 0) {
                this.logger.debug(`Routing key: "${key}" of ${route.path}, will be ignored`);
            }
        });
        return childrenRoutes;
    }

}

// UTILS
function normalizePath(path: string): string {
    return path.replace("//", "/");
}
