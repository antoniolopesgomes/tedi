import * as _ from "lodash";
import {RouteAction, RouteActions, RouteActionsBuilder} from "./core";
import {BaseModule} from "../module";
import {Service} from "../service";
import {HTTP_METHODS_NAMES} from "../core/http";
import {ControllerMetadataManager} from "../controller";

const JSON_HTTP_METHOD_KEYS = HTTP_METHODS_NAMES;
const JSON_CONTROLLER_KEY = "$controller";

// TODO test this stuff
@Service()
export class BaseRouteActionsBuilder implements RouteActionsBuilder {

    public build(jsonRoute: any, module: BaseModule): RouteActions {
        let routeActions = <RouteActions> {};
        Object.keys(JSON_HTTP_METHOD_KEYS).forEach(httpMethodName => {
            routeActions[httpMethodName] = this._parseRouteAction(httpMethodName, jsonRoute, module);
        });
        return routeActions;
    }

    private _parseRouteAction(method: string, jsonRoute: any, module: BaseModule): RouteAction {
        return  this._parseRouteActionFromArray(method, jsonRoute, module) ||
                this._parseRouteActionFromController(method, jsonRoute, module);
    }

    private _parseRouteActionFromArray(httpMethodName: string, jsonRoute: any, module: BaseModule): RouteAction {
        let routeAction = <string[]> jsonRoute[httpMethodName];

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

    private _parseRouteActionFromController(httpMethodName: string, jsonRoute: any, module: BaseModule): RouteAction {
        let controllerToken: any = jsonRoute[JSON_CONTROLLER_KEY];
        if (!controllerToken) {
            return undefined;
        }

        let controller = module.getDependency(controllerToken);
        let actionMetadata = ControllerMetadataManager.getActionMetadata(httpMethodName, controller);

        if (!actionMetadata) {
            return undefined;
        }

        return {
            controller: controller,
            controllerMethod: actionMetadata.methodName,
        };
    }

}