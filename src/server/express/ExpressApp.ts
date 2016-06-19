'use strict';
import * as express from 'express';
import * as http from 'http';
import {
    Config,
    App,
    inject,
    injectable,
    Logger
} from '../../core';
import {Promise} from '../../extensions';
import {RouteDefinition, Router, RouteAction} from '../../router';
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
    
}