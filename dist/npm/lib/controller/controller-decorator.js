"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var controller_metadata_1 = require("./controller-metadata");
var di_1 = require("../di");
var METADATA_KEYS = require("../constants/metadata-keys");
var ERRORS = require("../constants/error-messages");
var core_1 = require("../core");
// CUSTOM ERRORS USED BY THIS MODULE
var ControllerDecoratorError = (function (_super) {
    __extends(ControllerDecoratorError, _super);
    function ControllerDecoratorError(controllerName, msg, error) {
        _super.call(this, controllerName + "\": " + msg, error);
    }
    return ControllerDecoratorError;
}(core_1.CustomError));
exports.ControllerDecoratorError = ControllerDecoratorError;
var ControllerActionDecoratorError = (function (_super) {
    __extends(ControllerActionDecoratorError, _super);
    function ControllerActionDecoratorError(controllerName, actionName, msg, error) {
        _super.call(this, controllerName + "#" + actionName + ": " + msg, error);
    }
    return ControllerActionDecoratorError;
}(core_1.CustomError));
exports.ControllerActionDecoratorError = ControllerActionDecoratorError;
function ControllerDecorator() {
    return function (target) {
        try {
            di_1.Dependency()(target);
            Reflect.defineMetadata(METADATA_KEYS.CONTROLLER, true, target);
        }
        catch (error) {
            throw new ControllerDecoratorError(target.name, ERRORS.CONTROLLER_ERROR_DECORATING, error);
        }
    };
}
ControllerDecorator.get = function () {
    return ControllerActionMethodDecorator("GET");
};
ControllerDecorator.post = function () {
    return ControllerActionMethodDecorator("POST");
};
ControllerDecorator.delete = function () {
    return ControllerActionMethodDecorator("DELETE");
};
ControllerDecorator.put = function () {
    return ControllerActionMethodDecorator("PUT");
};
function ControllerActionMethodDecorator(action) {
    return function (target, propertyKey, descriptor) {
        var targetConstructorName = target.constructor.name;
        if (controller_metadata_1.ControllerMetadata.actionMethodName(action, target)) {
            throw new ControllerActionDecoratorError(targetConstructorName, action.toUpperCase(), ERRORS.CONTROLLER_ACTION_DUPLICATE);
        }
        Reflect.defineMetadata(METADATA_KEYS[action.toUpperCase()], propertyKey, target);
    };
}
exports.Controller = ControllerDecorator;
