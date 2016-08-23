"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
require("reflect-metadata");
var _ = require("lodash");
var di_1 = require("../di");
var core_1 = require("../core");
var BaseModule = (function () {
    function BaseModule(parentModule) {
        this._parentModule = parentModule;
        this._di = new di_1.DIModule();
        // initialize
        this.init();
    }
    BaseModule.prototype.getParentModule = function () {
        return this._parentModule;
    };
    BaseModule.prototype.dependencies = function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var deps = _.isArray(args) ? args : [];
        deps.forEach(function (dep) {
            _this.setDependency(dep);
        });
        return this;
    };
    BaseModule.prototype.setDependency = function (dep) {
        if (_.isUndefined(dep) || _.isNull(dep)) {
            return this;
        }
        if (!(dep instanceof di_1.DependencyInfo)) {
            dep = di_1.dependency(dep);
        }
        this._di.setDependency(dep);
        return this;
    };
    BaseModule.prototype.setModule = function (token, moduleClass) {
        this.setDependency(di_1.dependency(token, { value: new moduleClass(this) }));
        return this;
    };
    BaseModule.prototype.getDependency = function (token) {
        var depInstance = this._getBindingRecursively(token);
        if (!depInstance) {
            throw new ModuleError(this, "Could not find dependency \"" + (token || "?").toString() + "\" in the module tree", null);
        }
        return depInstance;
    };
    BaseModule.prototype.snapshot = function () {
        this._di.snapshot();
        return this;
    };
    BaseModule.prototype.restore = function () {
        this._di.restore();
        return this;
    };
    BaseModule.prototype.setJsonRoutes = function (value) {
        this._di.setDependency(di_1.dependency("RoutesDefinition", { value: value }));
        return this;
    };
    BaseModule.prototype.getJsonRoutes = function () {
        return this._di.getDependency("RoutesDefinition");
    };
    BaseModule.prototype._getBindingRecursively = function (abstraction) {
        var currentModule = this;
        while (currentModule) {
            if (currentModule._di.hasDependency(abstraction)) {
                return currentModule._di.getDependency(abstraction);
            }
            currentModule = currentModule.getParentModule();
        }
        return null;
    };
    return BaseModule;
}());
exports.BaseModule = BaseModule;
var ModuleError = (function (_super) {
    __extends(ModuleError, _super);
    function ModuleError(module, msg, error) {
        _super.call(this, module.constructor.name + " - " + msg, error);
    }
    return ModuleError;
}(core_1.CustomError));
exports.ModuleError = ModuleError;
