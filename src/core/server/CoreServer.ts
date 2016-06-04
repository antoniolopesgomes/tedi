import * as express from 'express';
import * as Promise from 'bluebird';
import * as http from 'http';
import {App} from '../app';
import {Server} from './index';

export class CoreServer implements Server {
    
    private _app: App;
    private _server: http.Server;
    
    constructor(app: App) {
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