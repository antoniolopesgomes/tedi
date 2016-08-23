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
var express = require("express");
var di_1 = require("../../di");
var filter_1 = require("../../filter");
var controller_1 = require("../../controller");
var service_1 = require("../../service");
var ExpressAppBuilder = (function () {
    function ExpressAppBuilder(_logger, _router) {
        this._logger = _logger;
        this._router = _router;
    }
    ExpressAppBuilder.prototype.buildApp = function (jsonRoutes, module) {
        var rootRoute = this._router.getRootRoute(jsonRoutes, module);
        var app = express();
        this._buildRouting(app, rootRoute);
        return app;
    };
    ExpressAppBuilder.prototype._buildRouting = function (app, route) {
        var _this = this;
        // add app filters, this should be done before defining the action methods
        this._addFilters(app, route);
        // Create routes first, do not attach error handlers just yet
        // express error handlers should be attached after the routing tree is built if we want
        // the error to bubble up trough the error handlers
        this._addActions(app, route);
        // recursive - create the children routers and attach them to parent
        (route.children || []).forEach(function (childRoute) {
            _this._buildRouting(app, childRoute);
        });
        // errorHandlers are setted in the end
        this._addErrorHandlers(app, route);
    };
    ExpressAppBuilder.prototype._addActions = function (app, route) {
        // set actions
        this._logger.debug("Adding actions for route: " + route);
        this._addAction("get", app, route);
        this._addAction("post", app, route);
        this._addAction("put", app, route);
        this._addAction("delete", app, route);
    };
    ExpressAppBuilder.prototype._addAction = function (method, app, routeDefinition) {
        var _this = this;
        var routeAction = routeDefinition[method.toLowerCase()];
        // if there is no route action do nothing
        if (!routeAction) {
            return;
        }
        var controller = routeAction.controller;
        var controllerName = controller.constructor.name;
        var methodName = routeAction.controllerMethod;
        var actionInfo = "Action: " + controllerName + "#" + methodName;
        //
        this._logger.debug("app." + method + "(" + routeDefinition.path + ", action)");
        app[method](routeDefinition.path, function (req, res, next) {
            var requestInfo = "(" + req.originalUrl + ") - " + actionInfo;
            Promise
                .resolve(true)
                .then(function () {
                _this._logger.debug(requestInfo + " [CALLING]");
                return controller[methodName](req, res);
            })
                .then(function () {
                _this._logger.debug(requestInfo + " [SUCCESS]");
            })
                .catch(function (error) {
                _this._logger.error(requestInfo + " [ERROR]", error);
                next(new controller_1.ActionError(controllerName, methodName, error));
            });
        });
    };
    ExpressAppBuilder.prototype._addFilters = function (app, route) {
        var _this = this;
        var filters = route.filters.map(function (routeFilter) {
            var filter = routeFilter.filter;
            var filterName = routeFilter.name;
            var filterInfo = "Filter: " + routeFilter.name;
            return function (req, res, next) {
                var requestInfo = "(" + req.originalUrl + ") - " + filterInfo;
                Promise
                    .resolve(true)
                    .then(function () {
                    _this._logger.debug(requestInfo + " [CALLING]");
                    return filter.apply(req, res);
                })
                    .then(function () {
                    _this._logger.debug(requestInfo + " [SUCCESS]");
                    // if the headers block was sent by this filter
                    // stop downstream propagation
                    // we expect that the response has ended
                    if (!res.headersSent) {
                        _this._logger.warn(requestInfo + " [!] Filter sent headers.");
                        next();
                    }
                })
                    .catch(function (error) {
                    _this._logger.error(requestInfo + " [ERROR]", error);
                    next(new filter_1.FilterError(filterName, error));
                });
            };
        });
        if (filters.length > 0) {
            this._logger.debug("app.use(" + route.path + ", ...filters)");
            app.use.apply(app, [route.path].concat(filters));
        }
    };
    ExpressAppBuilder.prototype._addErrorHandlers = function (app, route) {
        var _this = this;
        var errorHandlers = route.errorHandlers.map(function (routeErrorHandler) {
            var errorHandlerInfo = "ErrorHandler: " + routeErrorHandler.name;
            var errorHandler = routeErrorHandler.errorHandler;
            return function (error, req, res, next) {
                var requestInfo = "(" + req.originalUrl + ") - " + errorHandlerInfo;
                Promise
                    .resolve(true)
                    .then(function () {
                    _this._logger.debug(requestInfo + " [CALLING]");
                    return errorHandler.catch(error, req, res);
                })
                    .then(function () {
                    _this._logger.debug(requestInfo + " [SUCCESS]");
                })
                    .catch(function (err) {
                    _this._logger.error(requestInfo + " [ERROR]", err);
                    next(err);
                });
            };
        });
        if (errorHandlers.length > 0) {
            this._logger.debug("app.use(" + route.path + ", ...errorHandlers)");
            app.use.apply(app, [route.path].concat(errorHandlers));
        }
    };
    ExpressAppBuilder = __decorate([
        service_1.Service(),
        __param(0, di_1.inject("Logger")),
        __param(1, di_1.inject("Router")), 
        __metadata('design:paramtypes', [Object, Object])
    ], ExpressAppBuilder);
    return ExpressAppBuilder;
}());
exports.ExpressAppBuilder = ExpressAppBuilder;
