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
var ErrorHandlerDecoratorError = (function (_super) {
    __extends(ErrorHandlerDecoratorError, _super);
    function ErrorHandlerDecoratorError(errorHandlerName, msg, error) {
        _super.call(this, errorHandlerName + "\": " + msg, error);
    }
    return ErrorHandlerDecoratorError;
}(core_1.CustomError));
exports.ErrorHandlerDecoratorError = ErrorHandlerDecoratorError;
function ErrorHandlerDecorator() {
    return function (target) {
        try {
            di_1.Dependency()(target);
            Reflect.defineMetadata(METADATA_KEYS.ERROR_HANDLER, true, target);
        }
        catch (error) {
            throw new ErrorHandlerDecoratorError(target.name, ERRORS.ERROR_HANDLER_ERROR_DECORATING, error);
        }
    };
}
exports.ErrorHandler = ErrorHandlerDecorator;
