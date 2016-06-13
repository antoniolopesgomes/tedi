'use strict';
import * as express from 'express';
import * as http from 'http';
import {Promise} from '../../extensions';
import {Config} from '../../config';
import {injectable, inject} from '../../Server';
import {App} from '../core';
import {Route, Router, RouteAction} from '../../router';
import {Logger} from '../../logging';
import {ExpressAppBuilder} from './ExpressAppBuilder';

@injectable()
export class ExpressApp extends App {

    private _app: express.Application;
    private _server: http.Server;

    constructor(
        @inject('Config') private _config: Config,
        private _router: Router,
        private _logger: Logger,
        private _appBuilder: ExpressAppBuilder
    ) {
        super();
        if (!this._config) {
            throw new Error('Application: No config was found.');
        }
    }

    getApp(): express.Application {
        if (!this._app) {
            this._app = this._appBuilder.buildApp(this._router.getRoutesConfiguration());
        }
        return this._app;
    }

    listen(): Promise<any> {

        let app = this.getApp();

        return new Promise((resolve: Function, reject: Function) => {
            this._server = app.listen(
                this._config.server.port,
                (error: any) => { return error ? reject(error) : resolve(); }
            )
        });
    }

    close(): Promise<any> {
        return new Promise((resolve: Function, reject: Function) => {
            if (!this._server) {
                return resolve();
            }
            this._server.close((error: any) => {
                this._server = null;
                return error ? reject(error) : resolve();
            });
        })
        .finally(() => {
            this._app = null;
        })
    }
}