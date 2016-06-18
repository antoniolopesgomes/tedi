'use strict';
import * as express from 'express';
import * as http from 'http';
import {Promise} from '../../extensions';
import {Config} from '../../config';
import {injectable, inject} from '../../modules';
import {App} from '../core';
import {RouteDefinition, Router, RouteAction} from '../../router';
import {Logger} from '../../logging';
import {ExpressAppBuilder} from './ExpressAppBuilder';

@injectable()
export class ExpressApp implements App {

    private _app: express.Application;
    private _server: http.Server;
    private _appBuilder: ExpressAppBuilder;

    constructor(
        private _config: Config,
        private _logger: Logger,
        private _router: Router
    ) {
        this._appBuilder = new ExpressAppBuilder(this._logger);
    }

    getApp(): express.Application {
        if (!this._app) {
            this._app = this._appBuilder.buildApp(this._router.getRouterRoot());
        }
        return this._app;
    }

    listen(): Promise<any> {

        let app = this.getApp();

        return new Promise((resolve: Function, reject: Function) => {
            this._server = app.listen(
                this._config.getValue().port,
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