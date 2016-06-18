'use strict';

import {Promise} from '../extensions';

const APP_SYMBOL = Symbol('App');


export interface App {
    listen(): Promise<any>;
    close(): Promise<any>;
}

function throwError(message: string): void {
    throw new Error(`App: ${message}`);
}