"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var controller_metadata_1 = require("./controller-metadata");
var core_1 = require("../core");
var ControllerValidatorError = (function (_super) {
    __extends(ControllerValidatorError, _super);
    function ControllerValidatorError(controller, msg, error) {
        _super.call(this, controller.constructor.name + ": " + msg, error);
    }
    return ControllerValidatorError;
}(core_1.CustomError));
exports.ControllerValidatorError = ControllerValidatorError;
var ControllerValidator = (function () {
    function ControllerValidator() {
    }
    ControllerValidator.hasValidMetadata = function (controller) {
        return controller_metadata_1.ControllerMetadata.isDecorated(controller.constructor);
    };
    ControllerValidator.validate = function (controller) {
        // check if it was valid metadata
        if (!this.hasValidMetadata(controller)) {
            throw new ControllerValidatorError(controller, "must be decorated with @Controller");
        }
    };
    return ControllerValidator;
}());
exports.ControllerValidator = ControllerValidator;
