"use strict";
(function (LoggerLevels) {
    LoggerLevels[LoggerLevels["EMERGENCY"] = 0] = "EMERGENCY";
    LoggerLevels[LoggerLevels["ALERT"] = 1] = "ALERT";
    LoggerLevels[LoggerLevels["CRITICAL"] = 2] = "CRITICAL";
    LoggerLevels[LoggerLevels["ERROR"] = 3] = "ERROR";
    LoggerLevels[LoggerLevels["WARNING"] = 4] = "WARNING";
    LoggerLevels[LoggerLevels["NOTICE"] = 5] = "NOTICE";
    LoggerLevels[LoggerLevels["INFO"] = 6] = "INFO";
    LoggerLevels[LoggerLevels["DEBUG"] = 7] = "DEBUG";
})(exports.LoggerLevels || (exports.LoggerLevels = {}));
var LoggerLevels = exports.LoggerLevels;
