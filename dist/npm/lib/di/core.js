"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var core_1 = require("../core");
var inversify_1 = require("inversify");
exports.inject = inversify_1.inject;
exports.injectable = inversify_1.injectable;
(function (BindingContext) {
    BindingContext[BindingContext["SINGLETON"] = 0] = "SINGLETON";
    BindingContext[BindingContext["TRANSIENT"] = 1] = "TRANSIENT";
    BindingContext[BindingContext["VALUE"] = 2] = "VALUE";
})(exports.BindingContext || (exports.BindingContext = {}));
var BindingContext = exports.BindingContext;
var DIModuleError = (function (_super) {
    __extends(DIModuleError, _super);
    function DIModuleError(msg, error) {
        _super.call(this, "" + msg, error);
    }
    return DIModuleError;
}(core_1.CustomError));
exports.DIModuleError = DIModuleError;
