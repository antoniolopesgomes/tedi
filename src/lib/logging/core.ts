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

export class Logger {

    warn(msg: string): void {
        throwError('#warn not implemented');
    }

    info(msg: string): void {
        throwError('#info not implemented');
    }

    error(msg: string, err: any): void {
        throwError('#error not implemented');
    }

    debug(msg: any): void {
        throwError('#debug not implemented');
    }

    setLevel(leven: any): void {
        throwError('#setLevel not implemented');
    }
}

function throwError(message: string) {
    throw new Error(`Logger: ${message}`);
}