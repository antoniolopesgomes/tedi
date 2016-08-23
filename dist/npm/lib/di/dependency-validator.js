"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var dependency_metadata_1 = require("./dependency-metadata");
var core_1 = require("../core");
var di_1 = require("../di");
var DependencyValidatorError = (function (_super) {
    __extends(DependencyValidatorError, _super);
    function DependencyValidatorError(msg, error) {
        _super.call(this, msg, error);
    }
    return DependencyValidatorError;
}(core_1.CustomError));
exports.DependencyValidatorError = DependencyValidatorError;
var DependencyValidator = (function () {
    function DependencyValidator() {
    }
    DependencyValidator.isDecorated = function (target, options) {
        var targetIsClass = options.context !== di_1.BindingContext.VALUE;
        return dependency_metadata_1.DependencyMetadata.isDecorated(targetIsClass ? target : target.constructor);
    };
    DependencyValidator.validate = function (target, options) {
        if (!DependencyValidator.isDecorated(target, options)) {
            throw new DependencyValidatorError("target \"" + target.constructor.name + "\" must be decorated with @Dependency");
        }
    };
    return DependencyValidator;
}());
exports.DependencyValidator = DependencyValidator;
