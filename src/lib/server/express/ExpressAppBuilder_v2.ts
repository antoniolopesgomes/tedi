import * as express from 'express';
import {inject, injectable} from '../../modules';
import {Router} from '../../router';
import {Logger} from '../../logger';
import {IFilter, FilterError} from '../../filters';
import {IErrorHandler, ErrorHandlerError} from '../../errors';
import {ActionError} from '../../controllers';
import {RouteDefinition, RouteAction, RouteFilter, RouteErrorHandler} from '../../router';

export class ExpressAppBuilder_v2 {

    constructor(
        public logger: Logger
    ) {
    }

    buildApp(route: RouteDefinition): express.Application {
        let app = express();
        //add app filters, this should be done before defining the action methods
        this._addFilters(app, route);        
        //Create routes first, do not attach error handlers just yet
        //express error handlers should be attached after the routing tree is built if we want
        //the error to bubble up trough the error handlers
        route.children.forEach((childRoute: RouteDefinition) => {
            this._buildRouting(app, childRoute);
        })
        this._addErrorHandlers(app, route);
        return app;
    }

    private _buildRouting(app: express.Application, route: RouteDefinition): void {
        //do not forget: always add filters before setting the actions
        this._addFilters(app, route);
        this._addActions(app, route);
        //recursive - create the children routers and attach them to parent
        (route.children || []).forEach((childRoute: RouteDefinition) => {
            this._buildRouting(app, childRoute);
        });
        //errorHandlers are setted in the end
        this._addErrorHandlers(app, route);
    }

    private _addActions(app: express.Application, route: RouteDefinition): void {
        //set actions
        this._addAction('get', app, route.fullPath, route.get);
        this._addAction('post', app, route.fullPath, route.post);
        this._addAction('put', app, route.fullPath, route.put);
        this._addAction('delete', app, route.fullPath, route.delete);
    }

    private _addAction(method: string, app: express.Application, fullPath: string, routeAction: RouteAction): void {
        //if there is no route action do nothing
        if (!routeAction) {
            return;
        }
        let controller: any = routeAction.controller;
        let controllerName: any = (<any> controller).constructor.name;
        let methodName: string = routeAction.controllerMethod;
        let actionInfo: string = `Action: ${controllerName}#${methodName}`;
        //
        this.logger.debug(`app.${method}(${fullPath}, action)`);
        app[method](fullPath, (req: express.Request, res: express.Response, next: express.NextFunction) => {
            let requestInfo = `(${req.originalUrl}) - ${actionInfo}`;
            Promise
                .resolve(true)
                .then(() => {
                    this.logger.debug(`${requestInfo} [CALLING]`);
                    return controller[methodName](req, res);
                })
                .then(() => {
                    this.logger.debug(`${requestInfo} [SUCCESS]`);
                })
                .catch((error) => {
                    this.logger.error(`${requestInfo} [ERROR]`, error);
                    next(new ActionError(controllerName, methodName, error));
                });
        })
    }

    private _addFilters(app: express.Application, route: RouteDefinition): void {
        let filters  = route.filters.map<express.RequestHandler>((routeFilter: RouteFilter) => {
            let filter = routeFilter.filter;
            let filterName = routeFilter.name;
            let filterInfo = `Filter: ${routeFilter.name}`;
            return (req: express.Request, res: express.Response, next: express.NextFunction): void => {
                let requestInfo = `(${req.originalUrl}) - ${filterInfo}`;
                Promise
                    .resolve(true)
                    .then(() => {
                        this.logger.debug(`${requestInfo} [CALLING]`);
                        return filter.apply(req, res);
                    })
                    .then(() => {
                        this.logger.debug(`${requestInfo} [SUCCESS]`);
                        //if the headers block was sent by this filter
                        //stop downstream propagation
                        //we expect that the response has ended
                        if (!res.headersSent) {
                            this.logger.warn(`${requestInfo} [!] Filter sent headers.`)
                            next();
                        }
                    })
                    .catch((error: any) => {
                        this.logger.error(`${requestInfo} [ERROR]`, error);
                        next(new FilterError(filterName, error));
                    });
            }
        });
        if (filters.length > 0) {
            this.logger.debug(`app.use(${route.fullPath}, ...filters)`);
            app.use.apply(app, (<any[]>[route.fullPath]).concat(filters));
        }
    }

    private _addErrorHandlers(app: express.Application, route: RouteDefinition): void {
        let errorHandlers = route.errorHandlers.map<express.ErrorRequestHandler>((routeErrorHandler: RouteErrorHandler) => {
            let errorHandlerInfo = `ErrorHandler: ${routeErrorHandler.name}`;
            let errorHandler = routeErrorHandler.errorHandler;
            return (error: any, req: express.Request, res: express.Response, next: express.NextFunction): void => {
                let requestInfo = `(${req.originalUrl}) - ${errorHandlerInfo}`;
                Promise
                    .resolve(true)
                    .then(() => {
                        this.logger.debug(`${requestInfo} [CALLING]`);
                        return errorHandler.catch(error, req, res);
                    })
                    .then(() => {
                        this.logger.debug(`${requestInfo} [SUCCESS]`);
                    })
                    .catch((error: any) => {
                        this.logger.error(`${requestInfo} [ERROR]`, error);
                        next(error);
                    });
            }
        });
        if (errorHandlers.length > 0) {
            this.logger.debug(`app.use(${route.fullPath}, ...errorHandlers)`);
            app.use.apply(app, (<any[]>[route.fullPath]).concat(errorHandlers));
        }
    }

}

function throwError(msg: string): void {
    throw new Error(`ExpressAppBuilder: ${msg}`);
}