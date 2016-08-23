"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var winston = require("winston");
var core_1 = require("./core");
var service_1 = require("../service");
function WinstonLoggerFactory(cfg) {
    cfg = cfg || {
        transports: [
            new winston.transports.Console(),
        ],
    };
    var WinstonLogger = (function () {
        function WinstonLogger() {
            this._logger = new winston.Logger(cfg);
            // set syslog levels
            this._logger.setLevels(winston.config.syslog.levels);
            this.setLevel(core_1.LoggerLevels.INFO);
        }
        WinstonLogger.prototype.warn = function (msg) {
            this._logger.log("warning", msg);
        };
        WinstonLogger.prototype.info = function (msg) {
            this._logger.info(msg);
        };
        WinstonLogger.prototype.error = function (msg, err) {
            this._logger.error(msg + " \n " + ((err && err.toString()) || "?"));
        };
        WinstonLogger.prototype.debug = function (msg) {
            this._logger.debug(msg);
        };
        WinstonLogger.prototype.setLevel = function (level) {
            var levelStr = null;
            switch (level) {
                case core_1.LoggerLevels.EMERGENCY:
                    levelStr = "emerg";
                    break;
                case core_1.LoggerLevels.ALERT:
                    levelStr = "alert";
                    break;
                case core_1.LoggerLevels.CRITICAL:
                    levelStr = "crit";
                    break;
                case core_1.LoggerLevels.ERROR:
                    levelStr = "error";
                    break;
                case core_1.LoggerLevels.WARNING:
                    levelStr = "warning";
                    break;
                case core_1.LoggerLevels.NOTICE:
                    levelStr = "notice";
                    break;
                case core_1.LoggerLevels.INFO:
                    levelStr = "info";
                    break;
                case core_1.LoggerLevels.DEBUG:
                    levelStr = "debug";
                    break;
                default:
                    levelStr = "info";
                    break;
            }
            this._logger.level = levelStr;
            return this;
        };
        WinstonLogger = __decorate([
            service_1.Service(), 
            __metadata('design:paramtypes', [])
        ], WinstonLogger);
        return WinstonLogger;
    }());
    ;
    return WinstonLogger;
}
exports.WinstonLoggerFactory = WinstonLoggerFactory;
