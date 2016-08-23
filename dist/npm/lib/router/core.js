"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var core_1 = require("../core");
(function (RouteMethod) {
    RouteMethod[RouteMethod["GET"] = 0] = "GET";
    RouteMethod[RouteMethod["POST"] = 1] = "POST";
    RouteMethod[RouteMethod["PUT"] = 2] = "PUT";
    RouteMethod[RouteMethod["DELETE"] = 3] = "DELETE";
})(exports.RouteMethod || (exports.RouteMethod = {}));
var RouteMethod = exports.RouteMethod;
var RouteError = (function (_super) {
    __extends(RouteError, _super);
    function RouteError(route, msg, error) {
        _super.call(this, "\"" + route.path + "\": " + msg, error);
    }
    return RouteError;
}(core_1.CustomError));
exports.RouteError = RouteError;
var RouterError = (function (_super) {
    __extends(RouterError, _super);
    function RouterError(msg, error) {
        _super.call(this, "" + msg, error);
    }
    return RouterError;
}(core_1.CustomError));
exports.RouterError = RouterError;
