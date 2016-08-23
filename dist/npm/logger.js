"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
__export(require("./lib/logger/core"));
var winston_logger_1 = require("./lib/logger/winston-logger");
exports.WinstonLoggerFactory = winston_logger_1.WinstonLoggerFactory;
