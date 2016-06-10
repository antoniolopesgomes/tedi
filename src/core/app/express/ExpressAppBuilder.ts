import * as express from 'express';
import {Route, Router, RouteAction} from '../../router';
import {Logger} from '../../logging';
import {injectable} from '../../Global';
import {Filter, ErrorHandler} from '../../index';

@injectable()
export class ExpressAppBuilder {

    constructor(
        public log: Logger
    ) {
    }

    buildApp(rootRoute: Route): express.Application {
        let app = express();
        //add app filters, this should be done before defining the app/router methods
        this.addFilters(app, rootRoute);
        //Create routes first, do not attach error handlers just yet
        //express error handlers should be attached after the routing tree is built if we want
        //the error to bubble up trough the error handlers
        rootRoute.children.forEach((childRoute: Route) => {
            app.use(childRoute.path, this.buildRouter(childRoute));
        })
        //add error handling for the app
        this.addErrorHandlers(app, rootRoute);
        //add error handlers to all the children
        rootRoute.children.forEach((childRoute: Route) => {
            this.attachErrorHandlersToRoute(childRoute);
        })

        return app;
    }

    buildRouter(route: Route): express.Router {
        let expressRouter = express.Router();
        //save a reference to the express.Router, it will be used later
        //to attach the errors handlers
        route.data.expressRouter = expressRouter;
        //do not forget: always add filters before setting the actions
        this.addFilters(expressRouter, route);
        this.addActions(expressRouter, route);
        //recursive - create the children routers and attach them to parent
        (route.children || []).forEach((childRoute: Route) => {
            expressRouter.use(childRoute.path, this.buildRouter(childRoute));
        });
        return expressRouter;
    }

    addActions(expressRouter: express.Router, route: Route): void {
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
        let methodName: string = routeAction.controllerMethod;
        //
        expressRoute[method]((req: any, res: any, next: Function) => {
            Promise
                .resolve(true)
                .then(() => {
                    return controller[methodName](req, res);
                })
                .catch((error) => next(error));
        })
    }

    addFilters(expressRouter: express.IRouter<any>, route: Route): void {
        let filters: express.RequestHandler[] = route.filters.map((filter: Filter<any>) => {
            return (req: express.Request, res: express.Response, next: Function): void => {
                Promise
                    .resolve(true)
                    .then(() => {
                        return filter.apply(req, res);
                    })
                    .then(() => {
                        //if the headers block was sent by this filter
                        //stop downstream propagation
                        //we expect that the response has ended
                        if (!res.headersSent) {
                            next();
                        }
                    })
                    .catch((error: any) => next(error));
            }
        });
        if (filters.length > 0) {
            expressRouter.use.apply(expressRouter, filters);
        }
    }

    attachErrorHandlersToRoute(route: Route): void {
        let expressRouter = route.data.expressRouter;
        if (!expressRouter) {
            throwError('Expected an instance of an express router to attach error handlers');
        }
        this.addErrorHandlers(route.data.expressRouter, route);
        route.children.forEach((childrenRoute: Route) => {
            this.attachErrorHandlersToRoute(childrenRoute);
        });
    }

    addErrorHandlers(expressRouter: express.IRouter<any>, route: Route): void {
        let errorHandlers: express.ErrorRequestHandler[] = route.errorHandlers.map((errorHandler: ErrorHandler) => {
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

}

function throwError(msg: string): void {
    throw new Error(`ExpressAppBuilder: ${msg}`);
}