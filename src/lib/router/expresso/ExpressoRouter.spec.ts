import {Global, injectable, BindingContext} from '../../Global';
import {Filter, ErrorHandler} from '../../core';
import {Route, Router, RoutesDefinition} from '../core';
import {ExpressoRouter} from '../expresso/ExpressoRouter';

describe('StrongExpressoRouter', () => {

    let routes = {
        "/auth": {
            "/login": {
                "$filters": ["DummyFilter"],
                "get": ["AuthController", "login"],
                "$errorHandlers": ["DummyErrorHandler"]
            }
        }
    };

    let strongExpressoRouter: Router;

    beforeAll(() => {
        Global.snapshot();
        strongExpressoRouter = new ExpressoRouter(routes);
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
                    .addFilter('DummyFilter', DummyFilterMock)
                    .addController('AuthController', AuthControllerMock)
                    .addErrorHandler('DummyErrorHandler', DummyErrorHandler);

                routeConfig = strongExpressoRouter.getRoutesConfiguration();
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
            class InvalidFilter {}
            
            let routes = {
                "/dummy": {
                    "$filters": ["InvalidFilter"]
                }
            }
            
            let expressoRouter = new ExpressoRouter(routes);
            
            beforeAll(() => {
                Global.addFilter<Filter<any>>('InvalidFilter', <any> InvalidFilter);
            })
            
            it('should throw an error', () => {
                expect(() => { expressoRouter.getRoutesConfiguration() })
                    .toThrowError(`CoreRouter: 'InvalidFilter' must extend from 'Filter'`);
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
            
            let coreCouter = new ExpressoRouter(routes);
            
            beforeAll(() => {
                Global.addErrorHandler('InvalidErrorHandler', <any> InvalidErrorHandler);
            })
            
            it('should throw an error', () => {
                expect(() => { coreCouter.getRoutesConfiguration() })
                    .toThrowError(`CoreRouter: 'InvalidErrorHandler' must extend from 'ErrorHandler'`);
            })
            
        })
        
    });


});