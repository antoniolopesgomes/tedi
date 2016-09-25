import * as _ from "lodash";

import * as RouterCore from "../core/router";
import {
    tedi,
    FilterHelper, BaseFilter,
    BaseErrorHandler, ErrorHandlerHelper,
    Logger,
    BaseModule, ModuleHelper,
    inject,
} from "../core";
import {TediRoute} from "../router";

const ROUTER_WORDS: any = {
    "FILTERS": "$filters",
    "ERROR_HANDLERS": "$errorHandlers",
};
const MODULE_HELPER = new ModuleHelper();
const FILTER_HELPER = new FilterHelper();
const ERROR_HANDLER_HELPER = new ErrorHandlerHelper();

@tedi.service()
export class TediRouter implements RouterCore.Router {

    constructor(
        @inject("Logger") private logger: Logger,
        @inject("RouteActionsBuilder") private _routeActionsBuilder: RouterCore.RouteActionsBuilder
    ) { }

    public getRootRoute(jsonRoutes: any, module: BaseModule): RouterCore.Route {
        return this._parseJsonRoute("/", jsonRoutes, module);
    }

    private _parseJsonRoute(path: string, jsonRoute: any, module: BaseModule): RouterCore.Route {
        let route: RouterCore.Route = new TediRoute(path);

        route.filters = this._parseRouteFilters(route, jsonRoute[ROUTER_WORDS.FILTERS], module);
        route.errorHandlers = this._parseRouteErrorHandlers(route, jsonRoute[ROUTER_WORDS.ERROR_HANDLERS], module);
        route.actions = this._routeActionsBuilder.build(jsonRoute, module);
        route.children = this._parseChildrenRoutes(jsonRoute, route, module);

        return route;
    }

    private _parseRouteFilters(route: RouterCore.Route, filterNames: string[], module: BaseModule): RouterCore.RouteFilter[] {

        if (!_.isArray(filterNames)) {
            return [];
        }

        return filterNames.map<RouterCore.RouteFilter>((name: string) => {
            let filter = module.getDependency<BaseFilter<any>>(name);
            try {
                FILTER_HELPER.validateInstance(filter);
            } catch (error) {
                throw new RouterCore.RouteError(route, `Invalid filter: "${name}"`, error);
            }
            return <RouterCore.RouteFilter> {
                filter: filter,
                name: name,
            };
        });
    }

    private _parseRouteErrorHandlers(route: RouterCore.Route, errorHandlersNames: string[], module: BaseModule): RouterCore.RouteErrorHandler[] {

        if (!_.isArray(errorHandlersNames)) {
            return [];
        }

        return errorHandlersNames.map<RouterCore.RouteErrorHandler>((name: string) => {
            let errorHandler = module.getDependency<BaseErrorHandler>(name);
            try {
                ERROR_HANDLER_HELPER.validateInstance(errorHandler);
            } catch (error) {
                throw new RouterCore.RouteError(route, `Could not validate errorHandler "${name}"`, error);
            }
            return <RouterCore.RouteErrorHandler>{
                errorHandler: errorHandler,
                name: name,
            };
        });
    }

    private _parseModuleRoute(route: RouterCore.Route, path: string, module: BaseModule): RouterCore.Route {

        try {
            MODULE_HELPER.validateInstance(module);
        } catch (error) {
            throw new RouterCore.RouteError(route, `Could not validate module "${name}"`, error);
        }

        return this._parseJsonRoute(path, module.getJsonRoutes(), module);
    }

    private _isModule(jsonRouteValue: any): boolean {
        return _.isString(jsonRouteValue);
    }

    private _parseChildrenRoutes(jsonRoute: any, route: RouterCore.Route, module: BaseModule): RouterCore.Route[] {
        let childrenRoutes: RouterCore.Route[] = [];
        Object.keys(jsonRoute).forEach((key: string) => {
            // all endpoints definitions begin with a slash
            if (key.indexOf("/") === 0) {
                let childJsonRouteValue = jsonRoute[key];
                let childRoutePath = normalizePath(route.path + key);
                let childRoute: RouterCore.Route;
                // if we"re deling with a module (string value)
                if (this._isModule(childJsonRouteValue)) {
                    childRoute = this._parseModuleRoute(route, childRoutePath, module.getDependency<BaseModule>(childJsonRouteValue));
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
