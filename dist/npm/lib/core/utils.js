"use strict";
var core_1 = require("../core");
var ExpressUtils = (function () {
    function ExpressUtils() {
    }
    ExpressUtils.runMiddleware = function (middleware, req, res) {
        return new core_1.Promise(function (resolve, reject) {
            middleware(req, res, function (error) {
                return error ? reject(error) : resolve();
            });
        });
    };
    return ExpressUtils;
}());
exports.ExpressUtils = ExpressUtils;
