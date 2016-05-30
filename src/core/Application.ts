'use strict';
import * as express from 'express';
import * as ioc from 'inversify';
import * as Promise from 'bluebird';
import * as http from 'http';
import {Config} from '../core';
import {RouteManager, Route, RouteConfig, RouteActionConfig} from './routes';

export interface Application {
    listen(): Promise<any>;
    close(): Promise<any>;
}

class ExpressApplication implements Application {

    private _app: express.Application;
    private _server: http.Server;

    constructor(
        private _config: Config,
        private _routeManager: RouteManager
    ) {
        if (!this._config) {
            throw new Error('Application: No config was found.');
        }
        this._app = express();
    }

    listen(): Promise<any> {
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

    configureRoutes(): Promise<any> {
        //let routes = this._routeManager.getRoutesConfiguration({});
        return Promise.resolve();
    }
}

function addRoute(app: express.Application, routeConfig: RouteConfig): express.Router {
    let router = express.Router();
    //filters
    let filters: express.RequestHandler[] = routeConfig.filters.map((filter: any) => {
        return (req: any, res: any, next: Function): void => {
            Promise
                .resolve(true)
                .then(() => {
                    return filter.apply(req, res);
                })
                .then(() => next())
                .catch((error) => next(error));
        }
    });
    router.use.apply(router, filters);
    //Actions
    //get
    if (routeConfig.get) {
        addAction(router, routeConfig, 'get');
    }
    //post
    if (routeConfig.post) {
        addAction(router, routeConfig, 'post');
    }
    //put
    if (routeConfig.put) {
        addAction(router, routeConfig, 'putget');
    }
    //delete
    if (routeConfig.delete) {
        addAction(router, routeConfig, 'delete');
    }

    return router;
}

function addAction(router: express.Router, routeConfig: RouteConfig, method: string): void {
    let routerAction: RouteActionConfig = routeConfig[method];
    router[method](routeConfig.path, (req: any, res: any, next: Function) => {
        let controller: any = routerAction.controller;
        let methodName: string = routerAction.controllerMethod;
        Promise
            .resolve(true)
            .then(() => {
                return controller[methodName](req, res);
            })
            .then(() => next())
            .catch((error) => next(error));
    })
}