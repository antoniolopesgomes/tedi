"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var core_1 = require("./core");
var METADATA_KEYS = require("../constants/metadata-keys");
var ERRORS = require("../constants/error-messages");
var core_2 = require("../core");
// CUSTOM ERRORS USED BY THIS MODULE
var DependencyDecoratorError = (function (_super) {
    __extends(DependencyDecoratorError, _super);
    function DependencyDecoratorError(dependencyName, msg, error) {
        _super.call(this, dependencyName + "\": " + msg, error);
    }
    return DependencyDecoratorError;
}(core_2.CustomError));
exports.DependencyDecoratorError = DependencyDecoratorError;
function DependencyDecorator() {
    return function (target) {
        try {
            core_1.injectable()(target);
            Reflect.defineMetadata(METADATA_KEYS.DEPENDENCY, true, target);
        }
        catch (error) {
            throw new DependencyDecoratorError(target.name, ERRORS.DEPENDENCY_ERROR_DECORATING, error);
        }
    };
}
exports.Dependency = DependencyDecorator;
