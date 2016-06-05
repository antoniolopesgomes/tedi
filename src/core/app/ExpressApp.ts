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

export function buildApp(rootRoute: Route): express.Application {
    let app = express();
    //add app filters, this should be done before defining the app/router methods
    addFilters(app, rootRoute);
    //Create routes first, do not attach error handlers just yet
    //express error handlers should be attached after the routing tree is built if we want
    //the error to bubble up trough the error handlers
    rootRoute.children.forEach((childRoute: Route) => {
        app.use(childRoute.path, buildRouter(childRoute));
    })
    //add error handling for the app
    addErrorHandlers(app, rootRoute);
    //add error handlers to all the children
    rootRoute.children.forEach((childRoute: Route) => {
        attachErrorHandlersToRoute(childRoute);
    })

    return app;
}

function buildRouter(route: Route): express.Router {
    let expressRouter = express.Router();
    //save a reference to the express.Router, it will be used later
    //to attach the errors handlers
    route.data.expressRouter = expressRouter;
    //do not forget: always add filters before setting the actions
    addFilters(expressRouter, route);
    addActions(expressRouter, route);
    //recursive - create the children routers and attach them to parent
    (route.children || []).forEach((childRoute: Route) => {
        expressRouter.use(childRoute.path, buildRouter(childRoute));
    });
    return expressRouter;
}

function addActions(expressRouter: express.Router, route: Route): void {
    //define route
    let expressRoute = expressRouter.route('/');
    //get
    if (route.get) {
        addAction('get', expressRoute, route);
    }
    //post
    if (route.post) {
        addAction('post', expressRoute, route);
    }
    //put
    if (route.put) {
        addAction('put', expressRoute, route);
    }
    //delete
    if (route.delete) {
        addAction('delete', expressRoute, route);
    }
}

function addAction(method: string, expressRoute: express.IRoute, route: Route): void {
    let routerAction = <RouteAction>route[method];
    let controller: any = routerAction.controller;
    let methodName: string = routerAction.controllerMethod;
    
    expressRoute[method]((req: any, res: any, next: Function) => {
        Promise
            .resolve(true)
            .then(() => {
                return controller[methodName](req, res);
            })
            .then(() => next())
            .catch((error) => next(error));
    })
}

function addFilters(expressRouter: express.IRouter<any>, route: Route): void {
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
        expressRouter.use.apply(expressRouter, filters);
    }
}

function attachErrorHandlersToRoute(route: Route): void {
    let expressRouter = route.data.expressRouter;
    if (!expressRouter) {
        throwError('Expected an instance of an express router to attach error handlers');
    }
    addErrorHandlers(route.data.expressRouter, route);
    route.children.forEach((childrenRoute: Route) => {
        attachErrorHandlersToRoute(childrenRoute);
    });
}


function addErrorHandlers(expressRouter: express.IRouter<any>, route: Route): void {
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
        expressRouter.use.apply(expressRouter, errorHandlers);
    }
}

function throwError(msg: string): void {
    throw new Error(`ExpressApp: ${msg}`);
}