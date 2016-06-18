import * as express from 'express';
import * as http from 'http';
import {Promise} from '../../extensions';
import {App} from '../../app';
import {Server} from '../core';

export class CoreServer extends Server {
    
    private _app: App;
    private _server: http.Server;
    
    constructor(app: App) {
        super();
        this._app = app;
        if (!this._app) {
            throw new Error('Server: Expected application');
        }
    }
    
    start(): Promise<any> {
        return this._app.listen();
    }
    
    stop(): Promise<any> {
        return this._app.close();
    }
}