"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var di_1 = require("../di");
var METADATA_KEYS = require("../constants/metadata-keys");
var ERRORS = require("../constants/error-messages");
var core_1 = require("../core");
// CUSTOM ERRORS USED BY THIS MODULE
var ModuleDecoratorError = (function (_super) {
    __extends(ModuleDecoratorError, _super);
    function ModuleDecoratorError(moduleName, msg, error) {
        _super.call(this, moduleName + "\": " + msg, error);
    }
    return ModuleDecoratorError;
}(core_1.CustomError));
exports.ModuleDecoratorError = ModuleDecoratorError;
function ModuleDecorator() {
    return function (target) {
        try {
            di_1.Dependency()(target);
            Reflect.defineMetadata(METADATA_KEYS.MODULE, true, target);
        }
        catch (error) {
            throw new ModuleDecoratorError(target.name, ERRORS.CONTROLLER_ERROR_DECORATING, error);
        }
    };
}
exports.Module = ModuleDecorator;
