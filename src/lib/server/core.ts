'use strict';

import {Promise} from '../extensions';

export class Server {
    start(): Promise<any> {
        return Promise.resolve().then(() => {
            throwError('start must be implemented');
        })
    }
    
    stop(): Promise<any> {
        return Promise.resolve().then(() => {
            throwError('stop must be implemented');
        })
    }
}

function throwError(message: string): void {
    throw new Error(`Server: ${message}`);
}