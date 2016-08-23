"use strict";
var METADATA_KEYS = require("../constants/metadata-keys");
var ServiceMetadata = (function () {
    function ServiceMetadata() {
    }
    ServiceMetadata.isDecorated = function (target) {
        return Reflect.hasMetadata(METADATA_KEYS.SERVICE, target);
    };
    return ServiceMetadata;
}());
exports.ServiceMetadata = ServiceMetadata;
