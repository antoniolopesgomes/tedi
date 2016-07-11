import * as express from 'express';
import {
    RouteDefinition,
    RouteAction,
    RoutesDefinition,
    Router
} from '../../router';
import {
    BindingContext,
    Controller,
    Filter,
    ErrorHandler,
    IFilter,
    IErrorHandler,
} from '../../core';
import {ExpressServer} from '../../server';
import {DefaultRouter} from '../../router';

describe('DefaultRouter', () => {

    let server = new ExpressServer();

    beforeEach(() => {
        server.snapshot();
    });

    afterEach(() => {
        server.restore();
    });

    describe('when I try to build a Routing tree', () => {

        let defaultRouter: Router;

        describe('with valid components', () => {

            let routeConfig: RouteDefinition;
            let authRoute: RouteDefinition;
            let loginRoute: RouteDefinition;

            @Controller()
            class AuthControllerMock {
                login() {
                    return;
                }
            }

            @Filter()
            class DummyFilterMock implements IFilter<any> {
                apply(req: express.Request, res: express.Response): any { }
                getDataFromRequest(req: express.Request): any { }
            }

            @ErrorHandler()
            class DummyErrorHandler implements IErrorHandler {
                catch(error: any, req: express.Request, res: express.Response): void { }
            }

            beforeEach(() => {
                server
                    .setRoutes({
                        "/auth": {
                            "/login": {
                                "$filters": ["DummyFilter"],
                                "get": ["AuthController", "login"],
                                "$errorHandlers": ["DummyErrorHandler"]
                            }
                        }
                    })
                    .setFilter('DummyFilter', DummyFilterMock)
                    .setController('AuthController', AuthControllerMock)
                    .setErrorHandler('DummyErrorHandler', DummyErrorHandler);

                routeConfig = server.component<Router>('Router').getRouterRoot();
            })

            it('first node should be the ROOT / ', () => {
                expect(routeConfig.path).toEqual('/');
            });

            describe('auth route', () => {
                beforeEach(() => {
                    authRoute = routeConfig.children[0];
                });
                it('should be present', () => {
                    expect(authRoute.path).toEqual('/auth');
                });
                it('fullPath should be right', () => {
                    expect(authRoute.fullPath).toEqual('/auth');
                });
            })

            describe('login route', () => {
                beforeEach(() => {
                    loginRoute = authRoute.children[0];
                })
                it('should be present', () => {
                    expect(loginRoute.path).toEqual('/login');
                });
                it('fullPath should be right', () => {
                    expect(loginRoute.fullPath).toEqual('/auth/login');
                });
                it('GET should be defined', () => {
                    expect(loginRoute.get.controller).toEqual(jasmine.any(AuthControllerMock));
                    expect(loginRoute.get.controllerMethod).toEqual('login');
                });
                it('POST should not exist', () => {
                    expect(loginRoute.post).toBeUndefined();
                })
                it('DELETE should not exist', () => {
                    expect(loginRoute.delete).toBeUndefined();
                })
                it('PUT should not exist', () => {
                    expect(loginRoute.put).toBeUndefined();
                })
                it('should have a dummyFilter', () => {
                    expect(loginRoute.filters).toEqual(jasmine.any(Array));
                    expect(loginRoute.filters.length).toEqual(1);
                    expect(loginRoute.filters[0].name).toEqual('DummyFilter');
                    expect(loginRoute.filters[0].filter).toEqual(jasmine.any(DummyFilterMock));
                });
                it('should have a errorHandler', () => {
                    expect(loginRoute.errorHandlers).toEqual(jasmine.any(Array));
                    expect(loginRoute.errorHandlers.length).toEqual(1);
                    expect(loginRoute.errorHandlers[0].name).toEqual('DummyErrorHandler');
                    expect(loginRoute.errorHandlers[0].errorHandler).toEqual(jasmine.any(DummyErrorHandler));
                });
            })

        })

        describe('with invalid filters', () => {

            @Filter()
            class InvalidFilter { }

            beforeEach(() => {
                server
                    .setRoutes({
                        "/dummy": {
                            "$filters": ["InvalidFilter"]
                        }
                    })
                    .setFilter<IFilter<any>>('InvalidFilter', <any>InvalidFilter);
            })

            it('should throw a FilterError', () => {
                expect(() => { server.component<Router>('Router').getRouterRoot() })
                    .toThrowError(`Router: 'InvalidFilter' must implement 'Filter'`);
            })

        })

        describe('with invalid errorHandlers', () => {

            @ErrorHandler()
            class InvalidErrorHandler { }

            beforeEach(() => {
                server
                    .setRoutes({
                        "/dummy": {
                            "$errorHandlers": ["InvalidErrorHandler"]
                        }
                    })
                    .setErrorHandler('InvalidErrorHandler', <any>InvalidErrorHandler);
            })

            it('should throw an ErrorHandlerError', () => {
                expect(() => { server.component<Router>('Router').getRouterRoot() })
                    .toThrowError(`Router: 'InvalidErrorHandler' must implement 'ErrorHandler'`);
            })

        })

    });

    describe('routing table', () => {

        @Controller()
        class BaseController {
            get(): void { }
            post(): void { }
        }

        let router: Router;

        beforeEach(() => {
            server
                .setRoutes({
                    '$filters': [],
                    '/path1': {
                        '$filters': [],
                        'get': ['Path1Controller', 'get'],
                        '$errorHandlers': [],
                        '/path11': {
                            '/path111': {
                                'get': ['Path111Controller', 'get']
                            }
                        }
                    },
                    '/path2': {
                        'post': ['Path2Controller', 'post']
                    }
                })
                .setController('Path1Controller', BaseController)
                .setController('Path111Controller', BaseController)
                .setController('Path2Controller', BaseController);

            router = server.component<Router>('Router');
        })

        it('/ should be defined', () => {
            expect(router.getPathRoute('/')).toEqual(jasmine.any(RouteDefinition));
        });
        it('/path1 should be defined', () => {
            expect(router.getPathRoute('/path1')).toEqual(jasmine.any(RouteDefinition));
        });
        it('/path1/path11 should be defined', () => {
            expect(router.getPathRoute('/path1/path11')).toEqual(jasmine.any(RouteDefinition));
        });
        it('/path1/path11/path111 should be defined', () => {
            expect(router.getPathRoute('/path1/path11/path111')).toEqual(jasmine.any(RouteDefinition));
        });
        it('/path2 should be defined', () => {
            expect(router.getPathRoute('/path2')).toEqual(jasmine.any(RouteDefinition));
        });

        describe('router#getPathAction', () => {
            describe('when the path and methods were defined', () => {
                let routerAction: RouteAction;
                beforeEach(() => {
                    routerAction = router.getPathAction('/path1/path11/path111', 'get');
                });
                it('should return a valid action', () => {
                    expect(routerAction.controller).toEqual(jasmine.any(BaseController));
                    expect(routerAction.controllerMethod).toEqual('get');
                });
            });
            describe('when the path is invalid', () => {
                let routerAction: RouteAction;
                beforeEach(() => {
                    routerAction = router.getPathAction('/invalid_path', 'get');
                });
                it('should return null', () => {
                    expect(routerAction).toBeNull();
                });
            });
            describe('when the method was not defined', () => {
                let routerAction: RouteAction;
                beforeEach(() => {
                    routerAction = router.getPathAction('/path1/path11/path111', 'delete');
                });
                it('should return null', () => {
                    expect(routerAction).toBeNull();
                });
            });


        });
    });

});