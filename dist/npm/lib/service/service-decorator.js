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
var ServiceDecoratorError = (function (_super) {
    __extends(ServiceDecoratorError, _super);
    function ServiceDecoratorError(controllerName, msg, error) {
        _super.call(this, controllerName + "\": " + msg, error);
    }
    return ServiceDecoratorError;
}(core_1.CustomError));
exports.ServiceDecoratorError = ServiceDecoratorError;
function ServiceDecorator() {
    return function (target) {
        try {
            di_1.Dependency()(target);
            Reflect.defineMetadata(METADATA_KEYS.SERVICE, true, target);
        }
        catch (error) {
            throw new ServiceDecoratorError(target.name, ERRORS.SERVICE_ERROR_DECORATING, error);
        }
    };
}
exports.Service = ServiceDecorator;
