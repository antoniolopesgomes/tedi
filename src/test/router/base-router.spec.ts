import {BaseRoute, Route, RouteError, BaseRouter} from '../../lib/router';
import {
    Controller, 
    Module, 
    BaseModule, 
    BaseFilter, 
    Filter, 
    ErrorHandler, 
    BaseErrorHandler,
} from '../../core';

describe('BaseRouter', () => {

    @Controller()
    class DummyController {
        get(): void { }
        post(): void { }
        put(): void { }
        delete(): void { }
    }

    @Module()
    class SimpleModule extends BaseModule {
        init(): void { }
    }

    @Filter()
    class SimpleFilter implements BaseFilter<any> {
        apply(): void { }
        getDataFromRequest(): any { }
    }

    @ErrorHandler()
    class SimpleErrorHandler implements BaseErrorHandler {
        catch(): void { }
    }

    let simpleModule: BaseModule;

    beforeEach(() => {
        simpleModule = new SimpleModule();
    });

    describe('when we have valid routes', () => {
        let route: Route;
        let router: BaseRouter;
        beforeEach(() => {
            //configure module
            simpleModule
                .setController('DummyController', DummyController)
                .setFilter('SimpleFilter', SimpleFilter)
                .setErrorHandler('SimpleErrorHandler', SimpleErrorHandler)
            //define routes
            let jsonRoutes = {
                '$filters': ['SimpleFilter'],
                '/one': {
                    '$errorHandlers': ['SimpleErrorHandler'],
                    'get': ['DummyController', 'get'],
                    'post': ['DummyController', 'post'],
                    'put': ['DummyController', 'put'],
                    'delete': ['DummyController', 'delete'],
                    '/two': {}
                }
            };
            router = new BaseRouter(null);
            //build route
            route = router.getRootRoute(jsonRoutes, simpleModule);
        });
        describe('root route', () => {
            it('base route should have the right path', () => {
                expect(route.path).toEqual('/');
            });
            it('should have one filter', () => {
                expect(route.filters).toEqual(jasmine.any(Array));
                expect(route.filters.length).toEqual(1);
            });
            it('filter should be the right instance', () => {
                expect(route.filters[0].filter).toEqual(jasmine.any(SimpleFilter));
                expect(route.filters[0].name).toEqual('SimpleFilter');
            });
            it('should have no errorHandlers', () => {
                expect(route.errorHandlers).toEqual(jasmine.any(Array));
                expect(route.errorHandlers.length).toEqual(0);
            });
            it('should have no actions', () => {
                expect(route.get).toBeUndefined();
                expect(route.post).toBeUndefined();
                expect(route.put).toBeUndefined();
                expect(route.delete).toBeUndefined();
            })
            it('should have one child route', () => {
                expect(route.children).toEqual(jasmine.any(Array));
                expect(route.children.length).toEqual(1);
            });
        });

        describe('route: /one', () => {
            let childRoute: Route;
            beforeEach(() => {
                childRoute = route.children[0];
            });
            it('base route should have the right path', () => {
                expect(childRoute.path).toEqual('/one');
            });
            it('should be a BaseRoute', () => {
                expect(childRoute).toEqual(jasmine.any(BaseRoute));
            });
            it('should have get action defined', () => {
                expect(childRoute.get.controller).toEqual(jasmine.any(DummyController));
                expect(childRoute.get.controllerMethod).toEqual('get');
            });
            it('should have post action defined', () => {
                expect(childRoute.post.controller).toEqual(jasmine.any(DummyController));
                expect(childRoute.post.controllerMethod).toEqual('post');
            });
            it('should have put action defined', () => {
                expect(childRoute.put.controller).toEqual(jasmine.any(DummyController));
                expect(childRoute.put.controllerMethod).toEqual('put');
            });
            it('should have delete action defined', () => {
                expect(childRoute.delete.controller).toEqual(jasmine.any(DummyController));
                expect(childRoute.delete.controllerMethod).toEqual('delete');
            });
            it('should have one errorHandler', () => {
                expect(childRoute.errorHandlers).toEqual(jasmine.any(Array));
                expect(childRoute.errorHandlers.length).toEqual(1);
            });
            it('errorHandler should be the right instance', () => {
                expect(childRoute.errorHandlers[0].errorHandler).toEqual(jasmine.any(SimpleErrorHandler));
                expect(childRoute.errorHandlers[0].name).toEqual('SimpleErrorHandler');
            });
        });

        describe('route /two', () => {
            let childRoute: Route;
            beforeEach(() => {
                childRoute = route.children[0].children[0];
            });
            it('should be defined', () => {
                expect(childRoute).toEqual(jasmine.any(BaseRoute));
            });
            it('should have the right path', () => {
                expect(childRoute.path).toEqual('/one/two');
            });
        });
    });

    describe('with invalid filters', () => {
        @Filter()
        class InvalidFilter { }

        let error: any;
        let jsonRouter: any;
        let router: BaseRouter;

        beforeEach(() => {
            //configure module
            simpleModule.setFilter('InvalidFilter', <any>InvalidFilter);
            //define router
            jsonRouter = {
                "/dummy": {
                    "$filters": ["InvalidFilter"]
                }
            };
            router = new BaseRouter(null);
        });

        it('should throw a FilterError', () => {
            try {
                router.getRootRoute(jsonRouter, simpleModule);
            }
            catch(error) {
                expect(error).toEqual(jasmine.any(RouteError));
            }
        });

    });

    describe('with invalid errorHandlers', () => {
        @ErrorHandler()
        class InvalidErrorHandler { }

        let error: any;
        let jsonRouter: any;
        let router: BaseRouter;

        beforeEach(() => {
            //configure module
            simpleModule.setErrorHandler('InvalidErrorHandler', <any>InvalidErrorHandler);
            //define router
            jsonRouter = {
                "/dummy": {
                    "$errorHandlers": ["InvalidErrorHandler"]
                }
            };
            router = new BaseRouter(null);
        })

        it('should throw an ErrorHandlerError', () => {
            try {
                router.getRootRoute(jsonRouter, simpleModule);
            }
            catch(error) {
                expect(error).toEqual(jasmine.any(RouteError));
            }
        })

    })
});