import * as express from 'express';
import {inject, injectable} from '../../modules';
import {Router} from '../../router';
import {Logger} from '../../logger';
import {Filter, FilterError} from '../../filters';
import {ErrorHandler, ErrorHandlerError} from '../../errors';
import {ActionError} from '../../controllers';
import {RouteDefinition, RouteAction, RouteFilter, RouteErrorHandler} from '../../router';

export class ExpressAppBuilder_v2 {

    constructor(
        public logger: Logger
    ) {
    }

    buildApp(rootRoute: RouteDefinition): express.Application {
        let app = express();
        //add app filters, this should be done before defining the app/router methods
        this.addFilters(app, rootRoute);
        //
        
        //Create routes first, do not attach error handlers just yet
        //express error handlers should be attached after the routing tree is built if we want
        //the error to bubble up trough the error handlers
        rootRoute.children.forEach((childRoute: RouteDefinition) => {
            this.buildRouting(app, childRoute);
            //app.use(childRoute.path, this.buildRouter(childRoute));
        })
        this.addErrorHandlers(app, rootRoute);
        //add error handling for the app
        //this.addErrorHandlers(app, rootRoute);
        //add error handlers to all the children
        //rootRoute.children.forEach((childRoute: RouteDefinition) => {
        //    this.attachErrorHandlersToRoute(app, childRoute);
        //})

        return app;
    }

    buildRouting(app: express.Application, route: RouteDefinition): void {
        //let expressRouter = express.Router();
        //save a reference to the express.Router, it will be used later
        //to attach the errors handlers
        //route.data.expressRouter = expressRouter;
        //do not forget: always add filters before setting the actions
        this.addFilters(app, route);
        this.addActions(app, route);
        //recursive - create the children routers and attach them to parent
        (route.children || []).forEach((childRoute: RouteDefinition) => {
            this.buildRouting(app, childRoute);
        });
        this.addErrorHandlers(app, route);
    }

    addActions(app: express.Application, route: RouteDefinition): void {
        //define route
        //let expressRoute = expressRouter.route('/');
        //set actions
        this.addAction('get', app, route.fullPath, route.get);
        this.addAction('post', app, route.fullPath, route.post);
        this.addAction('put', app, route.fullPath, route.put);
        this.addAction('delete', app, route.fullPath, route.delete);
    }

    addAction(method: string, app: express.Application, fullPath: string, routeAction: RouteAction): void {
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

    addFilters(app: express.Application, route: RouteDefinition): void {
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

    attachErrorHandlersToRoute(app: express.Application, route: RouteDefinition): void {
        this.addErrorHandlers(app, route);
        route.children.forEach((childrenRoute: RouteDefinition) => {
            this.attachErrorHandlersToRoute(app, childrenRoute);
        });
    }

    addErrorHandlers(app: express.Application, route: RouteDefinition): void {
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