'use strict';

export enum LoggerLevels {
    EMERGENCY,
    ALERT,
    CRITICAL,
    ERROR,
    WARNING,
    NOTICE,
    INFO,
    DEBUG
}

export abstract class Logger {
    abstract warn(msg: string): void;
    abstract info(msg: string): void;
    abstract error(msg: string, err: any): void;
    abstract debug(msg: any): void;
    abstract setLevel(leven: any);
}