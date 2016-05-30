import * as express from 'express';
import * as Promise from 'bluebird';
import {injectable} from 'inversify';
import {Application} from './Application';
import * as http from 'http';

export interface Server {
    
}

export class CoreServer implements Server {
    
    private _app: Application;
    private _server: http.Server;
    
    constructor(app: Application) {
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