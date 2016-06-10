'use strict';

export class Logger {

    warn(messge: string) {
        throwError('warn not implemented');
    }

    info(message: string) {
        throwError('info not implemented');
    }

    error(err: any) {
        throwError('error not implemented');
    }

}

function throwError(message: string) {
    throw new Error(`Logger: ${message}`);
}