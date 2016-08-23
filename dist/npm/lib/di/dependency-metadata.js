"use strict";
var METADATA_KEYS = require("../constants/metadata-keys");
var DependencyMetadata = (function () {
    function DependencyMetadata() {
    }
    DependencyMetadata.isDecorated = function (target) {
        return Reflect.hasMetadata(METADATA_KEYS.DEPENDENCY, target);
    };
    return DependencyMetadata;
}());
exports.DependencyMetadata = DependencyMetadata;
