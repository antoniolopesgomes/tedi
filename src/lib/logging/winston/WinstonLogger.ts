import * as winston from 'winston';
import {Logger, LoggerLevels} from '../core';
import {injectable} from '../../Server';

@injectable()
export class WinstonLogger extends Logger {

    private _logger: winston.LoggerInstance;

    constructor() {
        super();
        this._logger = new winston.Logger({
            transports: [
                new winston.transports.Console()
            ]
        });
        //set syslog levels
        this._logger.setLevels((<any> winston).config.syslog.levels);
        this.setLevel(LoggerLevels.INFO);
    }

    warn(msg: string): void {
        this._logger.warn(msg);
    }

    info(msg: string): void {
        this._logger.info(msg);
    }

    error(msg:string, err: any): void {
        this._logger.error(`${msg} \n ${(err && err.toString()) || '?'}`);
    }

    debug(msg: string):void {
        this._logger.debug(msg);
    }

    setLevel(level: LoggerLevels): void {
        let levelStr: string = null;
        switch (level) {
            case LoggerLevels.EMERGENCY:
                levelStr = 'emerg';
                break;
            case LoggerLevels.ALERT:
                levelStr = 'alert';
                break;
            case LoggerLevels.CRITICAL:
                levelStr = 'crit';
                break;
            case LoggerLevels.ERROR:
                levelStr = 'error';
                break;
            case LoggerLevels.WARNING:
                levelStr = 'warning';
                break;
            case LoggerLevels.NOTICE:
                levelStr = 'notice';
                break;
            case LoggerLevels.INFO:
                levelStr = 'info';
                break;
            case LoggerLevels.DEBUG:
                levelStr = 'debug';
                break;
            default:
                levelStr = 'info';
                break;
        }
        this._logger.level = levelStr;
    }

}