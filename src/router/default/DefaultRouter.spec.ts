import {
    injectable, 
    BindingContext,
    Filter,
    ErrorHandler,
} from '../../core';
import {
    RouteDefinition, 
    Router, 
    RouteAction, 
    RoutesDefinition
} from '../../router';
import {DefaultRouter} from '../../router/default';
import {ExpressServer} from '../../server/express';

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

            @injectable()
            class AuthControllerMock {
                login() {
                    return;
                }
            }

            @injectable()
            class DummyFilterMock extends Filter<any> { }

            @injectable()
            class DummyErrorHandler extends ErrorHandler { }

            beforeEach(() => {
                server
                    .setRoutesDefinition({
                        "/auth": {
                            "/login": {
                                "$filters": ["DummyFilter"],
                                "get": ["AuthController", "login"],
                                "$errorHandlers": ["DummyErrorHandler"]
                            }
                        }
                    })
                    .addFilter('DummyFilter', DummyFilterMock)
                    .addController('AuthController', AuthControllerMock)
                    .addErrorHandler('DummyErrorHandler', DummyErrorHandler);

                routeConfig = server.component<Router>(Router).getRouterRoot();
            })

            it('first node should be the ROOT / ', () => {
                expect(routeConfig.path).toEqual('/');
            });

            describe('auth route', () => {
                beforeEach(() => {
                    authRoute = routeConfig.children[0];
                })
                it('should be present', () => {
                    expect(authRoute.path).toEqual('/auth');
                })
            })

            describe('login route', () => {
                beforeEach(() => {
                    loginRoute = authRoute.children[0];
                })
                it('should be present', () => {
                    expect(loginRoute.path).toEqual('/login');
                })
                it('GET should be defined', () => {
                    expect(loginRoute.get.controller).toEqual(jasmine.any(AuthControllerMock));
                    expect(loginRoute.get.controllerMethod).toEqual('login');
                })
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

            @injectable()
            class InvalidFilter { }

            beforeEach(() => {
                server
                    .setRoutesDefinition({
                        "/dummy": {
                            "$filters": ["InvalidFilter"]
                        }
                    })
                    .addFilter<Filter<any>>('InvalidFilter', <any>InvalidFilter);
            })

            it('should throw an error', () => {
                expect(() => { server.component<Router>(Router).getRouterRoot() })
                    .toThrowError(`Router: 'InvalidFilter' must extend from 'Filter'`);
            })

        })

        describe('with invalid errorHandlers', () => {

            @injectable()
            class InvalidErrorHandler { }

            beforeEach(() => {
                server
                    .setRoutesDefinition({
                        "/dummy": {
                            "$errorHandlers": ["InvalidErrorHandler"]
                        }
                    })
                    .addErrorHandler('InvalidErrorHandler', <any>InvalidErrorHandler);
            })

            it('should throw an error', () => {
                expect(() => { server.component<Router>(Router).getRouterRoot() })
                    .toThrowError(`Router: 'InvalidErrorHandler' must extend from 'ErrorHandler'`);
            })

        })

    });

    describe('routing table', () => {

        @injectable()
        class BaseController {
            get(): void { }
            post(): void { }
        }

        let router: Router;

        beforeEach(() => {
            server
                .setRoutesDefinition({
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
                .addController('Path1Controller', BaseController)
                .addController('Path111Controller', BaseController)
                .addController('Path2Controller', BaseController);

            router = server.component<Router>(Router);
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