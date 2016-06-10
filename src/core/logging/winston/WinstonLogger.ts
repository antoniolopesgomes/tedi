import * as winston from 'winston';
import {Logger} from '../core';
import {injectable} from '../../Global';

@injectable()
export class WinstonLogger extends Logger {

    private _logger: winston.LoggerInstance;

    constructor() {
        super();
        this._logger = new winston.Logger({
            transports: [
                new winston.transports.Console()
            ]
        })
    }

    warn(message: string): void {
        this._logger.warn(message);
    }

    info(message: string): void {
        this._logger.info(message);
    }

    error(err: any): void {
        this._logger.error((err && err.toString()) || '?');
    }

}