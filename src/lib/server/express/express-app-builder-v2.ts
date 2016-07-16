import * as express from 'express';
import {inject, injectable} from '../../di';
import {Router} from '../../router';
import {Logger} from '../../logger';
import {BaseModule} from '../../module';
import {BaseFilter, FilterError} from '../../filter';
import {BaseErrorHandler, ErrorHandlerError} from '../../error-handler';
import {ActionError} from '../../controller';
import {Service} from '../../service';
import {Route, RouteAction, RouteFilter, RouteErrorHandler} from '../../router';

@Service()
export class ExpressAppBuilder_v2 {

    constructor(
        @inject('Logger') private _logger: Logger,
        @inject('Router') private _router: Router
    ) {
    }

    buildApp(jsonRoutes: any, module: BaseModule): express.Application {
        let rootRoute = this._router.getRootRoute(jsonRoutes, module);
        let app = express();
        this._buildRouting(app, rootRoute);
        return app;
    }

    private _buildRouting(app: express.Application, route: Route): void {
        //add app filters, this should be done before defining the action methods
        this._addFilters(app, route);
        //Create routes first, do not attach error handlers just yet
        //express error handlers should be attached after the routing tree is built if we want
        //the error to bubble up trough the error handlers
        this._addActions(app, route);
        //recursive - create the children routers and attach them to parent
        (route.children || []).forEach((childRoute: Route) => {
            this._buildRouting(app, childRoute);
        });
        //errorHandlers are setted in the end
        this._addErrorHandlers(app, route);
    }

    private _addActions(app: express.Application, route: Route): void {
        //set actions
        this._logger.debug(`Adding actions for route: ${route}`);
        this._addAction('get', app, route);
        this._addAction('post', app, route);
        this._addAction('put', app, route);
        this._addAction('delete', app, route);
    }

    private _addAction(method: string, app: express.Application, routeDefinition: Route): void {
        let routeAction: RouteAction = routeDefinition[method.toLowerCase()];
        //if there is no route action do nothing
        if (!routeAction) {
            return;
        }
        let controller: any = routeAction.controller;
        let controllerName: any = (<any> controller).constructor.name;
        let methodName: string = routeAction.controllerMethod;
        let actionInfo: string = `Action: ${controllerName}#${methodName}`;
        //
        this._logger.debug(`app.${method}(${routeDefinition.path}, action)`);
        app[method](routeDefinition.path, (req: express.Request, res: express.Response, next: express.NextFunction) => {
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
        })
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
                        //if the headers block was sent by this filter
                        //stop downstream propagation
                        //we expect that the response has ended
                        if (!res.headersSent) {
                            this._logger.warn(`${requestInfo} [!] Filter sent headers.`)
                            next();
                        }
                    })
                    .catch((error: any) => {
                        this._logger.error(`${requestInfo} [ERROR]`, error);
                        next(new FilterError(filterName, error));
                    });
            }
        });
        if (filters.length > 0) {
            this._logger.debug(`app.use(${route.path}, ...filters)`);
            app.use.apply(app, (<any[]>[route.path]).concat(filters));
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
                    .catch((error: any) => {
                        this._logger.error(`${requestInfo} [ERROR]`, error);
                        next(error);
                    });
            }
        });
        if (errorHandlers.length > 0) {
            this._logger.debug(`app.use(${route.path}, ...errorHandlers)`);
            app.use.apply(app, (<any[]>[route.path]).concat(errorHandlers));
        }
    }

}

function throwError(msg: string): void {
    throw new Error(`ExpressAppBuilder: ${msg}`);
}