"use strict";
var core_1 = require("./core");
var dependency_1 = require("./dependency");
var inversify = require("inversify");
var DIModule = (function () {
    function DIModule() {
        this._kernel = new inversify.Kernel();
    }
    DIModule.prototype.getDependency = function (token) {
        return this._kernel.get(token);
    };
    DIModule.prototype.hasDependency = function (token) {
        return this._kernel.isBound(token);
    };
    DIModule.prototype.removeDependency = function (token) {
        this._kernel.unbind(token);
    };
    DIModule.prototype.removeAll = function () {
        this._kernel.unbindAll();
    };
    DIModule.prototype.setDependency = function (dep) {
        if (!(dep instanceof dependency_1.DependencyInfo)) {
            console.warn("invalid dependency: " + dep);
            return;
        }
        if (this.hasDependency(dep.token)) {
            this.removeDependency(dep.token);
        }
        this._bindDependency(dep);
    };
    DIModule.prototype.snapshot = function () {
        this._kernel.snapshot();
    };
    DIModule.prototype.restore = function () {
        this._kernel.restore();
    };
    DIModule.prototype._bindDependency = function (dep) {
        if (dep.properties.class) {
            var concretion = dep.properties.class;
            // DependencyValidator.validate(concretion);
            var binding = this._kernel.bind(dep.token).to(concretion);
            if (!dep.properties.classIsTransient) {
                binding.inSingletonScope();
            }
        }
        else if (dep.properties.value) {
            var concretion = dep.properties.value;
            this._kernel.bind(dep.token).toConstantValue(concretion);
        }
        else {
            throw new core_1.DIModuleError("Invalid dependency: " + dep, null);
        }
    };
    return DIModule;
}());
exports.DIModule = DIModule;
