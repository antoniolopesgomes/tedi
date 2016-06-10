'use strict';

import {Promise} from '../extensions';

export class App {
    
    listen(): Promise<any> {
        return Promise
            .resolve()
            .then(() => {
                throwError('listen must be implemented');
            });
    }

    close(): Promise<any> {
        return Promise
            .resolve()
            .then(() => {
                throwError('close must be implemented');
            });
    }
}

function throwError(message: string): void {
    throw new Error(`App: ${message}`);
}