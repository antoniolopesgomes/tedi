import * as express from 'express';
import {RouteDefinition, Router, RouteAction, RouteFilter, RouteErrorHandler} from '../../router';
import {Logger} from '../../logging';
import {injectable} from '../../Server';
import {Filter, ErrorHandler, FilterError, ErrorHandlerError, ActionError} from '../../core';

@injectable()
export class ExpressAppBuilder {

    constructor(
        public logger: Logger
    ) {
    }

    buildApp(rootRoute: RouteDefinition): express.Application {
        let app = express();
        //add app filters, this should be done before defining the app/router methods
        this.addFilters(app, rootRoute);
        //Create routes first, do not attach error handlers just yet
        //express error handlers should be attached after the routing tree is built if we want
        //the error to bubble up trough the error handlers
        rootRoute.children.forEach((childRoute: RouteDefinition) => {
            app.use(childRoute.path, this.buildRouter(childRoute));
        })
        //add error handling for the app
        this.addErrorHandlers(app, rootRoute);
        //add error handlers to all the children
        rootRoute.children.forEach((childRoute: RouteDefinition) => {
            this.attachErrorHandlersToRoute(childRoute);
        })

        return app;
    }

    buildRouter(route: RouteDefinition): express.Router {
        let expressRouter = express.Router();
        //save a reference to the express.Router, it will be used later
        //to attach the errors handlers
        route.data.expressRouter = expressRouter;
        //do not forget: always add filters before setting the actions
        this.addFilters(expressRouter, route);
        this.addActions(expressRouter, route);
        //recursive - create the children routers and attach them to parent
        (route.children || []).forEach((childRoute: RouteDefinition) => {
            expressRouter.use(childRoute.path, this.buildRouter(childRoute));
        });
        return expressRouter;
    }

    addActions(expressRouter: express.Router, route: RouteDefinition): void {
        //define route
        let expressRoute = expressRouter.route('/');
        //set actions
        this.addAction('get', expressRoute, route.get);
        this.addAction('post', expressRoute, route.post);
        this.addAction('put', expressRoute, route.put);
        this.addAction('delete', expressRoute, route.delete);
    }

    addAction(method: string, expressRoute: express.IRoute, routeAction: RouteAction): void {
        //if there is no route action do nothing
        if (!routeAction) {
            return;
        }
        let controller: any = routeAction.controller;
        let controllerName: any = (<any> controller).constructor.name;
        let methodName: string = routeAction.controllerMethod;
        let actionInfo: string = `Action: ${controllerName}#${methodName}`;
        //
        expressRoute[method]((req: express.Request, res: express.Response, next: express.NextFunction) => {
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

    addFilters(expressRouter: express.IRouter<any>, route: RouteDefinition): void {
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
            expressRouter.use.apply(expressRouter, filters);
        }
    }

    attachErrorHandlersToRoute(route: RouteDefinition): void {
        let expressRouter = route.data.expressRouter;
        if (!expressRouter) {
            throwError('Expected an instance of an express router to attach error handlers');
        }
        this.addErrorHandlers(route.data.expressRouter, route);
        route.children.forEach((childrenRoute: RouteDefinition) => {
            this.attachErrorHandlersToRoute(childrenRoute);
        });
    }

    addErrorHandlers(expressRouter: express.IRouter<any>, route: RouteDefinition): void {
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
            expressRouter.use.apply(expressRouter, errorHandlers);
        }
    }

}

function throwError(msg: string): void {
    throw new Error(`ExpressAppBuilder: ${msg}`);
}