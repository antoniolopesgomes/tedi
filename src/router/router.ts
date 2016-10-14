import * as _ from "lodash";

import {
    Logger, LOGGER,
    Router,
    RouteActionsBuilder, ROUTE_ACTIONS_BUILDER,
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
        @Inject(LOGGER) private logger: Logger,
        @Inject(ROUTE_ACTIONS_BUILDER) private _routeActionsBuilder: RouteActionsBuilder
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

    private _parseRouteFilters(route: Route, tokens: any[], module: Module): RouteFilter[] {

        if (!_.isArray(tokens)) {
            return [];
        }

        return tokens.map<RouteFilter>((token: any) => {
            let filter = module.getDependency<Filter<any>>(token);
            try {
                validateFilter(filter);
            } catch (error) {
                throw new RouteError(route, `Invalid filter: "${token}"`, error);
            }
            return <RouteFilter> {
                filter: filter,
                token: token,
            };
        });
    }

    private _parseRouteErrorHandlers(route: Route, tokens: any[], module: Module): RouteErrorHandler[] {

        if (!_.isArray(tokens)) {
            return [];
        }

        return tokens.map<RouteErrorHandler>((token: string) => {
            let errorHandler = module.getDependency<ErrorHandler>(token);
            try {
                validateErrorHandler(errorHandler);
            } catch (error) {
                throw new RouteError(route, `Could not validate errorHandler "${token}"`, error);
            }
            return <RouteErrorHandler> {
                errorHandler: errorHandler,
                token: token,
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
            }
        });
        return childrenRoutes;
    }

}

// UTILS
function normalizePath(path: string): string {
    return path.replace("//", "/");
}
