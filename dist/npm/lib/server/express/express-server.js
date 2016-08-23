"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var logger_1 = require("../../logger");
var module_1 = require("../../module");
var service_1 = require("../../service");
var di_1 = require("../../di");
var core_1 = require("../../core");
var router_1 = require("../../router");
var express_app_builder_1 = require("./express-app-builder");
var ExpressServer = (function (_super) {
    __extends(ExpressServer, _super);
    function ExpressServer() {
        _super.call(this);
    }
    ExpressServer.prototype.init = function () {
        // set dependencies
        this
            .dependencies(di_1.dependency("Server", { value: this }), di_1.dependency("ExpressAppBuilder", { class: express_app_builder_1.ExpressAppBuilder }), di_1.dependency("Router", { class: router_1.BaseRouter }), di_1.dependency("Logger", { class: logger_1.WinstonLoggerFactory() }), di_1.dependency("Config", { value: { port: 8080 } }));
    };
    ExpressServer.prototype.setConfig = function (config) {
        this.setDependency(di_1.dependency("Config", { value: config }));
        return this;
    };
    ExpressServer.prototype.getConfig = function () {
        return this.getDependency("Config");
    };
    ExpressServer.prototype.getApp = function () {
        if (!this._app) {
            var jsonRoutes = this.getJsonRoutes();
            var appBuilder = this.getDependency("ExpressAppBuilder");
            this._app = appBuilder.buildApp(jsonRoutes, this);
        }
        return this._app;
    };
    ExpressServer.prototype.run = function () {
        var _this = this;
        var config = this.getDependency("Config");
        var logger = this.getDependency("Logger");
        return new core_1.Promise(function (resolve, reject) {
            _this._server = _this.getApp().listen(config.port, function (error) {
                return error ? reject(error) : resolve(_this._server);
            });
        }).then(function (httpServer) {
            logger.debug("Server running on port: " + config.port + "...");
            return _this._server;
        });
    };
    ExpressServer.prototype.stop = function () {
        var _this = this;
        var logger = this.getDependency("Logger");
        return new core_1.Promise(function (resolve, reject) {
            if (!_this._server) {
                logger.debug("#stop called but no running server exists");
            }
            _this._server.close(function (error) {
                return error ? reject(error) : resolve();
            });
        }).then(function () {
            _this._server = null;
            logger.debug("Server stopped");
        });
    };
    ExpressServer = __decorate([
        service_1.Service(), 
        __metadata('design:paramtypes', [])
    ], ExpressServer);
    return ExpressServer;
}(module_1.BaseModule));
exports.ExpressServer = ExpressServer;
