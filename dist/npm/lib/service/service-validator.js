"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var service_metadata_1 = require("./service-metadata");
var core_1 = require("../core");
var di_1 = require("../di");
var ServiceValidatorError = (function (_super) {
    __extends(ServiceValidatorError, _super);
    function ServiceValidatorError(msg, error) {
        _super.call(this, msg, error);
    }
    return ServiceValidatorError;
}(core_1.CustomError));
exports.ServiceValidatorError = ServiceValidatorError;
var ServiceValidator = (function () {
    function ServiceValidator() {
    }
    ServiceValidator.isValid = function (target, options) {
        var targetIsClass = options.context !== di_1.BindingContext.VALUE;
        return service_metadata_1.ServiceMetadata.isDecorated(targetIsClass ? target : target.constructor);
    };
    ServiceValidator.validate = function (target, options) {
        if (!ServiceValidator.isValid(target, options)) {
            throw new ServiceValidatorError("target \"" + target.constructor.name + "\" it\"s not a valid Service");
        }
    };
    return ServiceValidator;
}());
exports.ServiceValidator = ServiceValidator;
