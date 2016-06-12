'use strict';
import * as express from 'express';
import * as http from 'http';
import {Promise} from '../../extensions';
import {Config} from '../../config';
import {injectable, inject} from '../../Global';
import {App} from '../core';
import {Route, Router, RouteAction} from '../../router';
import {Logger} from '../../logging';
import {ExpressAppBuilder} from './ExpressAppBuilder';

@injectable()
export class ExpressApp extends App {

    private _app: express.Application;
    private _server: http.Server;

    constructor(
        private _config: Config,
        private _router: Router,
        private _logger: Logger,
        private _appBuilder: ExpressAppBuilder
    ) {
        super();
        if (!this._config) {
            throw new Error('Application: No config was found.');
        }
    }

    listen(): Promise<any> {
        //get routes
        let rootRoute = this._router.getRoutesConfiguration();
        //create root router
        this._app = this._appBuilder.buildApp(rootRoute);

        return new Promise((resolve: Function, reject: Function) => {
            this._server = this._app.listen(
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
    }
}