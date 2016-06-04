import {Global, injectable, BindingContext, Filter, ErrorHandler} from '../../core';
import {Route, CoreRouter, Router, RoutesDefinition} from '../../core/router';

describe('CoreRouter', () => {

    let routes = {
        "/auth": {
            "/login": {
                "$filters": ["DummyFilter"],
                "get": ["AuthController", "login"],
                "$errorHandlers": ["DummyErrorHandler"]
            }
        }
    };

    let coreRouter: Router;

    beforeAll(() => {
        Global.snapshot();
        coreRouter = new CoreRouter(routes);
    });

    afterAll(() => {
        Global.restore();
    });

    describe('when I try to build a Routing tree', () => {

        describe('with valid components', () => {

            let routeConfig: Route;
            let authRoute: Route;
            let loginRoute: Route;

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

            beforeAll(() => {
                Global
                    .registerFilter('DummyFilter', DummyFilterMock)
                    .registerController('AuthController', AuthControllerMock)
                    .registerErrorHandler('DummyErrorHandler', DummyErrorHandler);

                routeConfig = coreRouter.getRoutesConfiguration();
            })

            it('first node should be the ROOT / ', () => {
                expect(routeConfig.path).toEqual('/');
            });

            describe('auth route', () => {
                beforeAll(() => {
                    authRoute = routeConfig.children[0];
                })
                it('should be present', () => {
                    expect(authRoute.path).toEqual('/auth');
                })
            })

            describe('login route', () => {
                beforeAll(() => {
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
                    expect(loginRoute.filters[0]).toEqual(jasmine.any(DummyFilterMock));
                });
                it('should have a errorHandler', () => {
                    expect(loginRoute.errorHandlers).toEqual(jasmine.any(Array));
                    expect(loginRoute.errorHandlers.length).toEqual(1);
                    expect(loginRoute.errorHandlers[0]).toEqual(jasmine.any(DummyErrorHandler));
                });
            })

        })
        
        describe('with invalid filters', () => {
            
            @injectable()
            class InvalidFilter {}
            
            let routes = {
                "/dummy": {
                    "$filters": ["InvalidFilter"]
                }
            }
            
            let coreCouter = new CoreRouter(routes);
            
            beforeAll(() => {
                Global.registerFilter<Filter<any>>('InvalidFilter', <any> InvalidFilter);
            })
            
            it('should throw an error', () => {
                expect(() => { coreCouter.getRoutesConfiguration() })
                    .toThrowError(`'InvalidFilter' must extend from 'Filter'`);
            })
            
        })
        
        describe('with invalid errorHandlers', () => {
            
            @injectable()
            class InvalidErrorHandler {}
            
            let routes = {
                "/dummy": {
                    "$errorHandlers": ["InvalidErrorHandler"]
                }
            }
            
            let coreCouter = new CoreRouter(routes);
            
            beforeAll(() => {
                Global.registerErrorHandler('InvalidErrorHandler', <any> InvalidErrorHandler);
            })
            
            it('should throw an error', () => {
                expect(() => { coreCouter.getRoutesConfiguration() })
                    .toThrowError(`'InvalidErrorHandler' must extend from 'ErrorHandler'`);
            })
            
        })
        
    });


});