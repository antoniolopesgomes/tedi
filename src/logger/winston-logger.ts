import * as winston from "winston";
import {Logger, LoggerLevels, Service} from "../core";

export function WinstonLoggerFactory(cfg?: winston.LoggerOptions): new (...args) => Logger {

    cfg = cfg || {
        transports: [
            new winston.transports.Console(),
        ],
    };

    @Service()
    class WinstonLogger implements Logger {

        private _logger: winston.LoggerInstance;

        constructor() {
            this._logger = new winston.Logger(cfg);
            // set syslog levels
            this._logger.setLevels((<any> winston).config.syslog.levels);
            this.setLevel(LoggerLevels.INFO);
        }

        public warn(msg: string): void {
            this._logger.log("warning", msg);
        }

        public info(msg: string): void {
            this._logger.info(msg);
        }

        public error(msg: string, err: any): void {
            this._logger.error(`${msg} \n ${(err && err.toString()) || "?"}`);
        }

        public debug(msg: string): void {
            this._logger.debug(msg);
        }

        public setLevel(level: LoggerLevels): Logger {
            let levelStr: string = null;
            switch (level) {
                case LoggerLevels.EMERGENCY:
                    levelStr = "emerg";
                    break;
                case LoggerLevels.ALERT:
                    levelStr = "alert";
                    break;
                case LoggerLevels.CRITICAL:
                    levelStr = "crit";
                    break;
                case LoggerLevels.ERROR:
                    levelStr = "error";
                    break;
                case LoggerLevels.WARNING:
                    levelStr = "warning";
                    break;
                case LoggerLevels.NOTICE:
                    levelStr = "notice";
                    break;
                case LoggerLevels.INFO:
                    levelStr = "info";
                    break;
                case LoggerLevels.DEBUG:
                    levelStr = "debug";
                    break;
                default:
                    levelStr = "info";
                    break;
            }
            this._logger.level = levelStr;
            return this;
        }
    };

    return WinstonLogger;
}
