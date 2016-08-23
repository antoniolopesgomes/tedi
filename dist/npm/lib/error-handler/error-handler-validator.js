"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var error_handler_metadata_1 = require("./error-handler-metadata");
var core_1 = require("../core");
var lodash_1 = require("lodash");
var ErrorHandlerValidatorError = (function (_super) {
    __extends(ErrorHandlerValidatorError, _super);
    function ErrorHandlerValidatorError(errorHandler, msg, error) {
        _super.call(this, errorHandler.constructor.name + ": " + msg, error);
    }
    return ErrorHandlerValidatorError;
}(core_1.CustomError));
exports.ErrorHandlerValidatorError = ErrorHandlerValidatorError;
var ErrorHandlerValidator = (function () {
    function ErrorHandlerValidator() {
    }
    ErrorHandlerValidator.hasValidMetadata = function (errorHandler) {
        return error_handler_metadata_1.ErrorHandlerMetadata.isDecorated(errorHandler.constructor);
    };
    ErrorHandlerValidator.implementsErrorHandler = function (errorHandler) {
        return lodash_1.isFunction(errorHandler.catch);
    };
    ErrorHandlerValidator.validate = function (errorHandler) {
        // check if it implements BaseErrorHandler
        if (!this.implementsErrorHandler(errorHandler)) {
            throw new ErrorHandlerValidatorError(errorHandler, "must implement \"BaseErrorHandler\"");
        }
        // check if it was valid metadata
        if (!this.hasValidMetadata(errorHandler)) {
            throw new ErrorHandlerValidatorError(errorHandler, "must be decorated with @ErrorHandler");
        }
    };
    return ErrorHandlerValidator;
}());
exports.ErrorHandlerValidator = ErrorHandlerValidator;
