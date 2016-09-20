import * as _ from "lodash";
import {
    Router,
    Route,
    RouteActionsBuilder,
    RouterError,
    RouteError,
    RouteFilter,
    RouteErrorHandler,
} from "./core";
import {BaseRoute} from "./base-route";
import {BaseFilter, FilterValidator} from "../filter";
import {Service} from "../service";
import {BaseErrorHandler, ErrorHandlerValidator} from "../error-handler";
import {Logger} from "../logger";
import {BaseModule} from "../module";
import {inject} from "../di";

const ROUTER_WORDS: any = {
    "FILTERS": "$filters",
    "ERROR_HANDLERS": "$errorHandlers",
};

@Service()
export class BaseRouter implements Router {

    constructor(
        @inject("Logger") private logger: Logger,
        @inject("RouteActionsBuilder") private _routeActionsBuilder: RouteActionsBuilder
    ) { }

    public getRootRoute(jsonRoutes: any, module: BaseModule): Route {
        return this._parseJsonRoute("/", jsonRoutes, module);
    }

    private _parseJsonRoute(path: string, jsonRoute: any, module: BaseModule): Route {
        let route: Route = new BaseRoute(path);
        try {
            route.filters = this._parseRouteFilters(jsonRoute[ROUTER_WORDS.FILTERS], module);
            route.errorHandlers = this._parseRouteErrorHandlers(jsonRoute[ROUTER_WORDS.ERROR_HANDLERS], module);
            route.actions = this._routeActionsBuilder.build(jsonRoute, module);
            route.children = this._parseChildrenRoutes(jsonRoute, route, module);
        } catch (error) {
            throw new RouteError(route, "Error parsing route", error);
        }
        return route;
    }

    private _parseRouteFilters(filterNames: string[], module: BaseModule): RouteFilter[] {

        if (!_.isArray(filterNames)) {
            return [];
        }

        return filterNames.map<RouteFilter>((name: string) => {
            let filter = module.getDependency<BaseFilter<any>>(name);
            try {
                FilterValidator.validate(filter);
            } catch (error) {
                throw new RouterError(`Could not validate filter "${name}"`, error);
            }
            return <RouteFilter> {
                filter: filter,
                name: name,
            };
        });
    }

    private _parseRouteErrorHandlers(errorHandlersNames: string[], module: BaseModule): RouteErrorHandler[] {

        if (!_.isArray(errorHandlersNames)) {
            return [];
        }

        return errorHandlersNames.map<RouteErrorHandler>((name: string) => {
            let errorHandler = module.getDependency<BaseErrorHandler>(name);
            try {
                ErrorHandlerValidator.validate(errorHandler);
            } catch (error) {
                throw new RouterError(`Could not validate errorHandler "${name}"`, error);
            }
            return <RouteErrorHandler> {
                errorHandler: errorHandler,
                name: name,
            };
        });
    }

    private _parseModuleRoute(path: string, module: BaseModule): Route {

        function validateModule(aModule: BaseModule): void { return; }

        validateModule(module);

        return this._parseJsonRoute(path, module.getJsonRoutes(), module);
    }

    private _isModule(jsonRouteValue: any): boolean {
        return _.isString(jsonRouteValue);
    }

    private _parseChildrenRoutes(jsonRoute: any, route: Route, module: BaseModule): Route[] {
        let childrenRoutes: Route[] = [];
        Object.keys(jsonRoute).forEach((key: string) => {
            // all endpoints definitions begin with a slash
            if (key.indexOf("/") === 0) {
                let childJsonRouteValue = jsonRoute[key];
                let childRoutePath = normalizePath(route.path + key);
                let childRoute: Route;
                // if we"re deling with a module (string value)
                if (this._isModule(childJsonRouteValue)) {
                    childRoute = this._parseModuleRoute(childRoutePath, module.getDependency<BaseModule>(childJsonRouteValue));
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
