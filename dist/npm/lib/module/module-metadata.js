"use strict";
var METADATA_KEYS = require("../constants/metadata-keys");
var ModuleMetadata = (function () {
    function ModuleMetadata() {
    }
    ModuleMetadata.isDecorated = function (target) {
        return Reflect.hasMetadata(METADATA_KEYS.MODULE, target);
    };
    return ModuleMetadata;
}());
exports.ModuleMetadata = ModuleMetadata;
