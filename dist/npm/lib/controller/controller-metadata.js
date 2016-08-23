"use strict";
var METADATA_KEYS = require("../constants/metadata-keys");
var ControllerMetadata = (function () {
    function ControllerMetadata() {
    }
    ControllerMetadata.isDecorated = function (target) {
        return Reflect.hasMetadata(METADATA_KEYS.CONTROLLER, target);
    };
    ControllerMetadata.actionMethodName = function (action, target) {
        return Reflect.getMetadata(METADATA_KEYS[action.toUpperCase()], target);
    };
    ControllerMetadata.GET = function (target) {
        return {
            name: this.actionMethodName("GET", target),
        };
    };
    ControllerMetadata.POST = function (target) {
        return {
            name: this.actionMethodName("POST", target),
        };
    };
    ControllerMetadata.DELETE = function (target) {
        return {
            name: this.actionMethodName("DELETE", target),
        };
    };
    ControllerMetadata.PUT = function (target) {
        return {
            name: this.actionMethodName("PUT", target),
        };
    };
    return ControllerMetadata;
}());
exports.ControllerMetadata = ControllerMetadata;
