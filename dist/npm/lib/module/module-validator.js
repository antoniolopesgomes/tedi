"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var module_metadata_1 = require("./module-metadata");
var core_1 = require("../core");
var di_1 = require("../di");
var ModuleValidatorError = (function (_super) {
    __extends(ModuleValidatorError, _super);
    function ModuleValidatorError(msg, error) {
        _super.call(this, msg, error);
    }
    return ModuleValidatorError;
}(core_1.CustomError));
exports.ModuleValidatorError = ModuleValidatorError;
var ModuleValidator = (function () {
    function ModuleValidator() {
    }
    ModuleValidator.isValid = function (target, options) {
        var targetIsClass = options.context !== di_1.BindingContext.VALUE;
        return module_metadata_1.ModuleMetadata.isDecorated(targetIsClass ? target : target.constructor);
    };
    ModuleValidator.validate = function (target, options) {
        if (!ModuleValidator.isValid(target, options)) {
            throw new ModuleValidatorError("target \"" + target.constructor.name + "\" it\"s not a valid Module");
        }
    };
    return ModuleValidator;
}());
exports.ModuleValidator = ModuleValidator;
