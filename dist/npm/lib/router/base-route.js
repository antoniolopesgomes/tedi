"use strict";
var BaseRoute = (function () {
    function BaseRoute(path) {
        this.path = path;
    }
    BaseRoute.prototype.toString = function () {
        return "route: " + this.path;
    };
    return BaseRoute;
}());
exports.BaseRoute = BaseRoute;
