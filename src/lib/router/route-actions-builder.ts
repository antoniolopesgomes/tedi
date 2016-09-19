import {RouteAction, RouteActions} from "./core";
import {BaseModule} from "../module";
import {HttpMethods} from "../core/http";
import {ControllerMetadata} from "../controller";

const JSON_HTTP_METHOD_KEYS: HttpMethods<string> = {
    checkout: "checkout",
    copy: "copy",
    delete: "delete",
    get: "get",
    head: "head",
    lock: "lock",
    merge: "merge",
    mkactivity: "mkactivity",
    mkcol: "mkcol",
    move: "move",
    "m-search": "m-search",
    notify: "notify",
    options: "options",
    patch: "patch",
    post: "post",
    purge: "purge",
    put: "put",
    report: "report",
    search: "search",
    subscribe: "subscribe",
    trace: "trace",
    unlock: "unlock",
    unsubscribe: "unsubscribe",
};

const JSON_CONTROLLER_KEY = "$controller";

export class RouteActionsBuilder {

    public build(jsonRoute: any, module: BaseModule): RouteActions {
        let routeActions = <RouteActions> {};
        Object.keys(JSON_HTTP_METHOD_KEYS).forEach(key => {
            routeActions[key] = this._parseRouteAction(JSON_HTTP_METHOD_KEYS[key], jsonRoute, module);
        });
        return routeActions;
    }

    private _parseRouteAction(method: string, jsonRoute: any, module: BaseModule): RouteAction {
        return  this._parseRouteActionFromArray(method, jsonRoute, module) ||
                this._parseRouteActionFromController(method, jsonRoute, module);
    }

    private _parseRouteActionFromArray(method: string, jsonRoute: any, module: BaseModule): RouteAction {
        let routeAction = <string[]> jsonRoute[method];

        if (!routeAction) {
            return undefined;
        }
        if (!_.isArray(routeAction) || routeAction.length < 2) {
            throw new Error("parseRouteAction: action should have two string fields [controller, controllerMethod]");
        }

        let controllerToken = routeAction[0];
        let methodName = routeAction[1];
        let controller: any = module.getDependency(controllerToken);

        if (!_.isFunction(controller[methodName])) {
            throw new Error(`parseRouteAction: invalid controller[${controllerToken}] method[${methodName}]`);
        }

        return {
            controller: controller,
            controllerMethod: methodName,
        };
    }

    private _parseRouteActionFromController(method: string, jsonRoute: any, module: BaseModule): RouteAction {
        let controllerToken: any = jsonRoute[JSON_CONTROLLER_KEY];
        if (!controllerToken) {
            return undefined;
        }

        let controller = module.getDependency(controllerToken);
        let controllerActionMetadata = ControllerMetadata.getHttpMethodMetadata(method, controller);

        if (!controllerActionMetadata.name) {
            return undefined;
        }

        return {
            controller: controller,
            controllerMethod: controllerActionMetadata.name,
        };
    }

}
