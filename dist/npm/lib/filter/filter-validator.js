"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var filter_metadata_1 = require("./filter-metadata");
var core_1 = require("../core");
var lodash_1 = require("lodash");
var FilterValidatorError = (function (_super) {
    __extends(FilterValidatorError, _super);
    function FilterValidatorError(filter, msg, error) {
        _super.call(this, filter.constructor.name + ": " + msg, error);
    }
    return FilterValidatorError;
}(core_1.CustomError));
exports.FilterValidatorError = FilterValidatorError;
var FilterValidator = (function () {
    function FilterValidator() {
    }
    FilterValidator.hasValidMetadata = function (filter) {
        return filter_metadata_1.FilterMetadata.isDecorated(filter.constructor);
    };
    FilterValidator.implementsFilter = function (filter) {
        return lodash_1.isFunction(filter.apply) && lodash_1.isFunction(filter.getDataFromRequest);
    };
    FilterValidator.validate = function (filter) {
        // check if it implements BaseFilter
        if (!this.implementsFilter(filter)) {
            throw new FilterValidatorError(filter, "must implement \"BaseFilter\"");
        }
        // check if it was valid metadata
        if (!this.hasValidMetadata(filter)) {
            throw new FilterValidatorError(filter, "must be decorated with @Filter");
        }
    };
    return FilterValidator;
}());
exports.FilterValidator = FilterValidator;
