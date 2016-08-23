"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
exports.NestedError = require("nested-error-stacks");
var CustomError = (function (_super) {
    __extends(CustomError, _super);
    function CustomError(msg, error) {
        _super.call(this, msg, error);
        this.name = this.constructor.name;
    }
    CustomError.prototype.getRootCause = function () {
        var rootCause = this;
        while (rootCause.nested) {
            rootCause = rootCause.nested;
        }
        return rootCause;
    };
    return CustomError;
}(exports.NestedError));
exports.CustomError = CustomError;
