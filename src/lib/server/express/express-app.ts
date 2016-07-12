'use strict';
import * as express from 'express';
import * as http from 'http';
import {Config} from '../../config';
import {App} from '../../app';
import {inject} from '../../di';
import {Service} from '../../service';
import {Logger} from '../../logger/core';
import {Promise} from '../../core';
import {RouteDefinition, Router, RouteAction} from '../../router/core';
import {ExpressAppBuilder} from './express-app-builder';
import {ExpressAppBuilder_v2} from './express-app-builder-v2';

@Service()
export class ExpressApp implements App {

    private _app: express.Application;
    private _server: http.Server;
    private _appBuilder: ExpressAppBuilder_v2;

    constructor(
        @inject('Config') private _config: Config,
        @inject('Logger') private _logger: Logger,
        @inject('Router') private _router: Router
    ) {
        this._appBuilder = new ExpressAppBuilder_v2(this._logger);
    }

    getApp(): express.Application {
        if (!this._app) {
            this._app = this._appBuilder.buildApp(this._router.getRouterRoot());
        }
        return this._app;
    }
    
}