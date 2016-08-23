"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _ = require("lodash");
var core_1 = require("./core");
var base_route_1 = require("./base-route");
var filter_1 = require("../filter");
var service_1 = require("../service");
var controller_1 = require("../controller");
var error_handler_1 = require("../error-handler");
var di_1 = require("../di");
var ROUTER_WORDS = {
    "FILTERS": "$filters",
    "ERROR_HANDLERS": "$errorHandlers",
    "CONTROLLER": "$controller",
};
var BaseRouter = (function () {
    function BaseRouter(logger) {
        this.logger = logger;
    }
    BaseRouter.prototype.getRootRoute = function (jsonRoutes, module) {
        return this._parseJsonRoute("/", jsonRoutes, module);
    };
    BaseRouter.prototype._parseJsonRoute = function (path, jsonRoute, module) {
        var route = new base_route_1.BaseRoute(path);
        try {
            route.filters = this._parseRouteFilters(jsonRoute[ROUTER_WORDS.FILTERS], module);
            route.errorHandlers = this._parseRouteErrorHandlers(jsonRoute[ROUTER_WORDS.ERROR_HANDLERS], module);
            route.get = this._parseRouteAction(core_1.RouteMethod.GET, jsonRoute, module);
            route.post = this._parseRouteAction(core_1.RouteMethod.POST, jsonRoute, module);
            route.delete = this._parseRouteAction(core_1.RouteMethod.DELETE, jsonRoute, module);
            route.put = this._parseRouteAction(core_1.RouteMethod.PUT, jsonRoute, module);
            route.children = this._parseChildrenRoutes(jsonRoute, route, module);
        }
        catch (error) {
            throw new core_1.RouteError(route, "Error parsing route", error);
        }
        return route;
    };
    BaseRouter.prototype._parseRouteAction = function (method, jsonRoute, module) {
        return this._parseRouteActionFromArray(method, jsonRoute, module) ||
            this._parseRouteActionFromController(method, jsonRoute, module);
    };
    BaseRouter.prototype._parseRouteActionFromArray = function (method, jsonRoute, module) {
        var routeAction;
        switch (method) {
            case core_1.RouteMethod.GET:
                routeAction = jsonRoute.get;
                break;
            case core_1.RouteMethod.POST:
                routeAction = jsonRoute.post;
                break;
            case core_1.RouteMethod.PUT:
                routeAction = jsonRoute.put;
                break;
            case core_1.RouteMethod.DELETE:
                routeAction = jsonRoute.delete;
                break;
            default:
                return undefined;
        }
        if (!routeAction) {
            return undefined;
        }
        if (!_.isArray(routeAction) || routeAction.length < 2) {
            throw new Error("parseRouteAction: action should have two string fields [controller, controllerMethod]");
        }
        var controllerName = routeAction[0];
        var methodName = routeAction[1];
        var controller = module.getDependency(controllerName);
        if (!_.isFunction(controller[methodName])) {
            throw new Error("parseRouteAction: invalid controller[" + controllerName + "] method[" + methodName + "]");
        }
        return {
            controller: controller,
            controllerMethod: methodName,
        };
    };
    BaseRouter.prototype._parseRouteActionFromController = function (method, jsonRoute, module) {
        var controllerToken = jsonRoute[ROUTER_WORDS.CONTROLLER];
        if (!controllerToken) {
            return undefined;
        }
        var controller = module.getDependency(controllerToken);
        var controllerActionMetadata;
        switch (method) {
            case core_1.RouteMethod.GET:
                controllerActionMetadata = controller_1.ControllerMetadata.GET(controller);
                break;
            case core_1.RouteMethod.POST:
                controllerActionMetadata = controller_1.ControllerMetadata.POST(controller);
                break;
            case core_1.RouteMethod.PUT:
                controllerActionMetadata = controller_1.ControllerMetadata.PUT(controller);
                break;
            case core_1.RouteMethod.DELETE:
                controllerActionMetadata = controller_1.ControllerMetadata.DELETE(controller);
                break;
            default:
                throw new Error("Unexpected method");
        }
        if (!controllerActionMetadata.name) {
            return undefined;
        }
        return {
            controller: controller,
            controllerMethod: controllerActionMetadata.name,
        };
    };
    BaseRouter.prototype._parseRouteFilters = function (filterNames, module) {
        if (!_.isArray(filterNames)) {
            return [];
        }
        return filterNames.map(function (name) {
            var filter = module.getDependency(name);
            try {
                filter_1.FilterValidator.validate(filter);
            }
            catch (error) {
                throw new core_1.RouterError("Could not validate filter \"" + name + "\"", error);
            }
            return {
                filter: filter,
                name: name,
            };
        });
    };
    BaseRouter.prototype._parseRouteErrorHandlers = function (errorHandlersNames, module) {
        if (!_.isArray(errorHandlersNames)) {
            return [];
        }
        return errorHandlersNames.map(function (name) {
            var errorHandler = module.getDependency(name);
            try {
                error_handler_1.ErrorHandlerValidator.validate(errorHandler);
            }
            catch (error) {
                throw new core_1.RouterError("Could not validate errorHandler \"" + name + "\"", error);
            }
            return {
                errorHandler: errorHandler,
                name: name,
            };
        });
    };
    BaseRouter.prototype._parseModuleRoute = function (path, module) {
        function validateModule(aModule) { return; }
        validateModule(module);
        return this._parseJsonRoute(path, module.getJsonRoutes(), module);
    };
    BaseRouter.prototype._isModule = function (jsonRouteValue) {
        return _.isString(jsonRouteValue);
    };
    BaseRouter.prototype._parseChildrenRoutes = function (jsonRoute, route, module) {
        var _this = this;
        var childrenRoutes = [];
        Object.keys(jsonRoute).forEach(function (key) {
            // all endpoints definitions begin with a slash
            if (key.indexOf("/") === 0) {
                var childJsonRouteValue = jsonRoute[key];
                var childRoutePath = normalizePath(route.path + key);
                var childRoute = void 0;
                // if we"re deling with a module (string value)
                if (_this._isModule(childJsonRouteValue)) {
                    childRoute = _this._parseModuleRoute(childRoutePath, module.getDependency(childJsonRouteValue));
                }
                else {
                    childRoute = _this._parseJsonRoute(childRoutePath, childJsonRouteValue, module);
                }
                childrenRoutes.push(childRoute);
            }
            else if (["$filters", "$errorHandlers", "get", "post", "put", "delete"].indexOf(key) < 0) {
                _this.logger.debug("Routing key: \"" + key + "\" of " + route.path + ", will be ignored");
            }
        });
        return childrenRoutes;
    };
    BaseRouter = __decorate([
        service_1.Service(),
        __param(0, di_1.inject("Logger")), 
        __metadata('design:paramtypes', [Object])
    ], BaseRouter);
    return BaseRouter;
}());
exports.BaseRouter = BaseRouter;
// UTILS
function normalizePath(path) {
    return path.replace("//", "/");
}
