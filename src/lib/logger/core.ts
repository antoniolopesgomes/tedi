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

export interface Logger {
    warn(msg: string): void;
    info(msg: string): void;
    error(msg: string, err: any): void;
    debug(msg: any): void;
    setLevel(leven: LoggerLevels);
}