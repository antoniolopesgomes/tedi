"use strict";
var METADATA_KEYS = require("../constants/metadata-keys");
var FilterMetadata = (function () {
    function FilterMetadata() {
    }
    FilterMetadata.isDecorated = function (target) {
        return Reflect.hasMetadata(METADATA_KEYS.FILTER, target);
    };
    return FilterMetadata;
}());
exports.FilterMetadata = FilterMetadata;
