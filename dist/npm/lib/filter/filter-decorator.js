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
var FilterDecoratorError = (function (_super) {
    __extends(FilterDecoratorError, _super);
    function FilterDecoratorError(filterName, msg, error) {
        _super.call(this, filterName + "\": " + msg, error);
    }
    return FilterDecoratorError;
}(core_1.CustomError));
exports.FilterDecoratorError = FilterDecoratorError;
function FilterDecorator() {
    return function (target) {
        try {
            di_1.Dependency()(target);
            Reflect.defineMetadata(METADATA_KEYS.FILTER, true, target);
        }
        catch (error) {
            throw new FilterDecoratorError(target.name, ERRORS.FILTER_ERROR_DECORATING, error);
        }
    };
}
exports.Filter = FilterDecorator;
