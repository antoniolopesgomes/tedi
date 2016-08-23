"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var core_1 = require("../core");
var FilterError = (function (_super) {
    __extends(FilterError, _super);
    function FilterError(name, err) {
        _super.call(this, "" + name, err);
    }
    return FilterError;
}(core_1.CustomError));
exports.FilterError = FilterError;
