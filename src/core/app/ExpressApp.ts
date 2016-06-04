'use strict';
import * as express from 'express';
import * as Promise from 'bluebird';
import * as http from 'http';
import {Config} from '../config';
import {App} from './index';
import {Route, Router, RouteAction} from '../../core/router';

export class ExpressApp implements App {

    private _app: express.Application;
    private _server: http.Server;

    constructor(
        private _config: Config,
        private _router: Router
    ) {
        if (!this._config) {
            throw new Error('Application: No config was found.');
        }
    }

    listen(): Promise<any> {
        //get routes
        let rootRoute = this._router.getRoutesConfiguration();
        //create root router
        this._app = buildApp(rootRoute);
        //let router = configureRoutes(this._app, this._router);
        //this._app.use(router);
        //listen
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

//HELPERS

export function buildApp(route: Route): express.Application {
    let app = express();
    //create root router
    route.children.forEach((route: Route) => {
        app.use(route.path, getExpressRouter(route))
    })
    return app;
}

function getExpressRouter(route: Route): express.Router {
    let expressRouter = express.Router();
    addFilters(expressRouter, route);
    addActions(expressRouter, route);
    addErrorHandlers(expressRouter, route);
    (route.children || []).forEach((childRoute: Route) => {
        expressRouter.use(childRoute.path, getExpressRouter(childRoute));
    });
    return expressRouter;
}

function addActions(expressRouter: express.Router, route: Route): void {
    let expressRoute = expressRouter.route('/');
    //get
    if (route.get) {
        addAction(expressRoute, route, 'get');
    }
    //post
    if (route.post) {
        addAction(expressRoute, route, 'post');
    }
    //put
    if (route.put) {
        addAction(expressRoute, route, 'put');
    }
    //delete
    if (route.delete) {
        addAction(expressRoute, route, 'delete');
    }
}

function addAction(expressRoute: express.IRoute, route: Route, method: string): void {
    let routerAction: RouteAction = route[method];
    expressRoute[method]((req: any, res: any, next: Function) => {
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

function addFilters(router: express.Router, route: Route): void {
    let filters: express.RequestHandler[] = route.filters.map((filter: any) => {
        return (req: express.Request, res: express.Response, next: Function): void => {
            Promise
                .resolve(true)
                .then(() => {
                    return filter.apply(req, res);
                })
                .then(() => next())
                .catch((error: any) => next(error));
        }
    });
    if (filters.length > 0) {
        router.use.apply(router, filters);
    }
}

function addErrorHandlers(router: express.Router, route: Route): void {
    let errorHandlers: express.ErrorRequestHandler[] = route.errorHandlers.map((errorHandler: any) => {
        return (error: any, req: express.Request, res: express.Response, next: Function): void => {
            Promise
                .resolve(true)
                .then(() => {
                    return errorHandler.catch(error, req, res);
                })
                .catch((error: any) => next(error));
        }
    });
    if (errorHandlers.length > 0) {
        router.use.apply(router, errorHandlers);
    }
}