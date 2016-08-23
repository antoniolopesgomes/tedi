"use strict";
var METADATA_KEYS = require("../constants/metadata-keys");
var ErrorHandlerMetadata = (function () {
    function ErrorHandlerMetadata() {
    }
    ErrorHandlerMetadata.isDecorated = function (target) {
        return Reflect.hasMetadata(METADATA_KEYS.ERROR_HANDLER, target);
    };
    return ErrorHandlerMetadata;
}());
exports.ErrorHandlerMetadata = ErrorHandlerMetadata;
