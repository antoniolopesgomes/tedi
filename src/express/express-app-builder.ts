import * as _ from "lodash";
import * as express from "express";

import {
    tedi,
    Router, Route, RouteAction, RouteFilter, RouteErrorHandler,
    inject,
    Logger,
    BaseModule,
    FilterError,
    ActionError,
    HTTP_METHODS_NAMES,
} from "../core";

@tedi.service()
export class ExpressAppBuilder {

    constructor(
        @inject("Logger") private _logger: Logger,
        @inject("Router") private _router: Router
    ) {
    }

    public buildApp(jsonRoutes: any, module: BaseModule): express.Application {
        let rootRoute = this._router.getRootRoute(jsonRoutes, module);
        let app = express();
        this._buildRouting(app, rootRoute);
        return app;
    }

    private _buildRouting(app: express.Application, route: Route): void {
        // add app filters, this should be done before defining the action methods
        this._addFilters(app, route);
        // Create routes first, do not attach error handlers just yet
        // express error handlers should be attached after the routing tree is built if we want
        // the error to bubble up trough the error handlers
        this._addActions(app, route);
        // recursive - create the children routers and attach them to parent
        (route.children || []).forEach((childRoute: Route) => {
            this._buildRouting(app, childRoute);
        });
        // errorHandlers are setted in the end
        this._addErrorHandlers(app, route);
    }

    private _addActions(app: express.Application, route: Route): void {
        // set actions
        this._logger.debug(`Adding actions for route: ${route}`);
        _.values<string>(HTTP_METHODS_NAMES).forEach((httpMethodName) => {
            this._addAction(app, httpMethodName, route);
        });
    }

    private _addAction(app: express.Application, httpMethodName: string, route: Route): void {
        let routeAction = <RouteAction> route.actions[httpMethodName];
        // if there is no route action do nothing
        if (!routeAction) {
            return;
        }
        let controller: any = routeAction.controller;
        let controllerName: any = (<any> controller).constructor.name;
        let methodName: string = routeAction.controllerMethod;
        let actionInfo: string = `Action: ${controllerName}#${methodName}`;
        //
        this._logger.debug(`app.${httpMethodName}(${route.path}, action)`);
        app[httpMethodName](route.path, (req: express.Request, res: express.Response, next: express.NextFunction) => {
            let requestInfo = `(${req.originalUrl}) - ${actionInfo}`;
            Promise
                .resolve(true)
                .then(() => {
                    this._logger.debug(`${requestInfo} [CALLING]`);
                    return controller[methodName](req, res);
                })
                .then(() => {
                    this._logger.debug(`${requestInfo} [SUCCESS]`);
                })
                .catch((error) => {
                    this._logger.error(`${requestInfo} [ERROR]`, error);
                    next(new ActionError(controllerName, methodName, error));
                });
        });
    }

    private _addFilters(app: express.Application, route: Route): void {
        let filters  = route.filters.map<express.RequestHandler>((routeFilter: RouteFilter) => {
            let filter = routeFilter.filter;
            let filterName = routeFilter.name;
            let filterInfo = `Filter: ${routeFilter.name}`;
            return (req: express.Request, res: express.Response, next: express.NextFunction): void => {
                let requestInfo = `(${req.originalUrl}) - ${filterInfo}`;
                Promise
                    .resolve(true)
                    .then(() => {
                        this._logger.debug(`${requestInfo} [CALLING]`);
                        return filter.apply(req, res);
                    })
                    .then(() => {
                        this._logger.debug(`${requestInfo} [SUCCESS]`);
                        // Middleware can, sometimes, end the request-response cycle
                        // BIt is normal but I decided to treat it as an exception, as such a warning is logged
                        if (res.headersSent) {
                            this._logger.warn(`${requestInfo} [!] Filter sent headers.`);
                        }
                        next();
                    })
                    .catch((error: any) => {
                        this._logger.error(`${requestInfo} [ERROR]`, error);
                        next(new FilterError(filterName, error));
                    });
            };
        });
        if (filters.length > 0) {
            this._logger.debug(`app.use(${route.path}, ...filters)`);
            app.use.apply(app, [route.path].concat(<any> filters));
        }
    }

    private _addErrorHandlers(app: express.Application, route: Route): void {
        let errorHandlers = route.errorHandlers.map<express.ErrorRequestHandler>((routeErrorHandler: RouteErrorHandler) => {
            let errorHandlerInfo = `ErrorHandler: ${routeErrorHandler.name}`;
            let errorHandler = routeErrorHandler.errorHandler;
            return (error: any, req: express.Request, res: express.Response, next: express.NextFunction): void => {
                let requestInfo = `(${req.originalUrl}) - ${errorHandlerInfo}`;
                Promise
                    .resolve(true)
                    .then(() => {
                        this._logger.debug(`${requestInfo} [CALLING]`);
                        return errorHandler.catch(error, req, res);
                    })
                    .then(() => {
                        this._logger.debug(`${requestInfo} [SUCCESS]`);
                    })
                    .catch((err: any) => {
                        this._logger.error(`${requestInfo} [ERROR]`, err);
                        next(err);
                    });
            };
        });
        if (errorHandlers.length > 0) {
            this._logger.debug(`app.use(${route.path}, ...errorHandlers)`);
            app.use.apply(app, (<any[]> [route.path]).concat(errorHandlers));
        }
    }

}
