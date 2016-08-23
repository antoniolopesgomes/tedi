"use strict";
var Promise = require("bluebird");
var GenericFilter = (function () {
    function GenericFilter(_requestHandler) {
        this._requestHandler = _requestHandler;
    }
    GenericFilter.prototype.apply = function (req, res) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._requestHandler(req, res, function (error) {
                return error ? reject(error) : resolve();
            });
        });
    };
    GenericFilter.prototype.getDataFromRequest = function (req) {
        throw new Error("Filter.getData must be implemented.");
    };
    return GenericFilter;
}());
exports.GenericFilter = GenericFilter;
