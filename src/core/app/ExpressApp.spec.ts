
import {buildApp} from './ExpressApp';
import {CoreRouter} from '../router';
import {Global, inject, injectable, Filter, ErrorHandler, BindingContext} from '../../core';
import * as request from 'supertest-as-promised';
import * as express from 'express';

describe('ExpressApp', () => {

    let routes = {
        "$errorHandlers": ["RootErrorHandler"],
        "$filters": ["RootFilter"],
        "/auth": {
            "$errorHandlers": ["AuthErrorHandler"],
            "/login": {
                "$filters": ["LoginFilter"],
                "get": ["AuthController", "login"],
                "$errorHandlers": ["LoginErrorHandler"],
                "/user": {
                    "$filters": ["UserFilter"],
                    "post": ["AuthController", "saveUser"]
                },
                "/admin": {
                    "$filters": ["AdminFilter"],
                    "post": ["AuthController", "saveAdmin"]
                }
            }
        }
    };

    @injectable()
    class AuthControllerMock {
        login(req, res: express.Response) {
            res.send(req.$thisFilter);
        }
        saveUser(req, res: express.Response) {
            res.send(req.$thisFilter);
        }
        saveAdmin(req, res: express.Response) {
            res.send(req.$thisFilter);
        }
    }

    @injectable()
    class CustomFilter extends Filter<any> {
        apply(): void { return; }
    }

    @injectable()
    class CustomErrorHandler extends ErrorHandler { }

    //components
    let authController: AuthControllerMock;
    let rootFilter: Filter<any>;
    let userFilter: Filter<any>;
    let loginFilter: Filter<any>;
    let adminFilter: Filter<any>;
    let rootErrorHandler: ErrorHandler;
    let loginErrorHandler: ErrorHandler;
    let authErrorHandler: ErrorHandler;

    beforeEach(() => {
        Global
            .snapshot()
            .registerController('AuthController', AuthControllerMock)
            .registerFilter('RootFilter', new CustomFilter(), { context: BindingContext.VALUE })
            .registerFilter('LoginFilter', new CustomFilter(), { context: BindingContext.VALUE })
            .registerFilter('UserFilter', new CustomFilter(), { context: BindingContext.VALUE })
            .registerFilter('AdminFilter', new CustomFilter(), { context: BindingContext.VALUE })
            .registerErrorHandler('RootErrorHandler', new CustomErrorHandler(), { context: BindingContext.VALUE })
            .registerErrorHandler('LoginErrorHandler', new CustomErrorHandler(), { context: BindingContext.VALUE })
            .registerErrorHandler('AuthErrorHandler', new CustomErrorHandler(), { context: BindingContext.VALUE });

        authController = Global.getController<AuthControllerMock>('AuthController');
        rootFilter = Global.getFilter<any>('RootFilter');
        userFilter = Global.getFilter<any>('UserFilter');
        loginFilter = Global.getFilter<any>('LoginFilter');
        adminFilter = Global.getFilter<any>('AdminFilter');
        rootErrorHandler = Global.getErrorHandler('RootErrorHandler');
        loginErrorHandler = Global.getErrorHandler('LoginErrorHandler');
        authErrorHandler = Global.getErrorHandler('AuthErrorHandler');
    });

    afterEach(() => {
        Global.restore();
    })

    describe('when we have a valid app', () => {

        let expressApp: express.Application;

        beforeEach(() => {
            let coreRouter = new CoreRouter(routes);
            expressApp = buildApp(coreRouter.getRoutesConfiguration());
        })

        describe('GET /auth/login', () => {

            beforeEach((done: DoneFn) => {
                spyOn(authController, 'saveUser').and.callThrough();
                spyOn(authController, 'login').and.callThrough();
                spyOn(userFilter, 'apply').and.callThrough();
                spyOn(rootFilter, 'apply').and.callThrough();
                spyOn(loginFilter, 'apply').and.callThrough();
                spyOn(adminFilter, 'apply').and.callThrough();
                
                return request(expressApp).get('/auth/login')
                    .expect(200)
                    .then(() => done())
                    .catch((error) => done.fail(error))
            })

            it('should have called the right controllers', () => {
                expect(authController.login).toHaveBeenCalled();
                expect(authController.saveUser).not.toHaveBeenCalled();
            })

            it('should have called the right filters', () => {
                //expect(rootFilter.apply).toHaveBeenCalled();
                expect(loginFilter.apply).toHaveBeenCalled();
                expect(userFilter.apply).not.toHaveBeenCalled();
                expect(adminFilter.apply).not.toHaveBeenCalled();
            })

        })

        xdescribe('POST /auth/login/user', () => {

            beforeEach((done: DoneFn) => {
                spyOn(rootFilter, 'apply').and.callThrough();
                spyOn(authController, 'saveUser').and.callThrough();
                spyOn(authController, 'login').and.callThrough();
                spyOn(userFilter, 'apply').and.callThrough();
                spyOn(loginFilter, 'apply').and.callThrough();
                spyOn(adminFilter, 'apply').and.callThrough();
                
                return request(expressApp).post('/auth/login/user')
                    .expect(200)
                    .then(() => done())
                    .catch((error) => done.fail(error))
            })

            it('should have called the right controllers', () => {
                expect(authController.saveUser).toHaveBeenCalled();
                expect(authController.login).not.toHaveBeenCalled();
            })

            it('should have called the right filters', () => {
                expect(rootFilter.apply).toHaveBeenCalled();
                expect(loginFilter.apply).toHaveBeenCalled();
                expect(userFilter.apply).toHaveBeenCalled();
                expect(adminFilter.apply).not.toHaveBeenCalled();
            })

        })

        xdescribe('and a controller throws an error', () => {
            beforeEach(() => {
                spyOn(authController, 'login').and.throwError('Error on controller.');
            })
            describe('and loginErrorHandler handles it', () => {
                beforeEach((done: DoneFn) => {
                    spyOn(loginErrorHandler, 'catch').and.callFake((error, req, res) => {
                        res.status(500).send('Error');
                    })
                    spyOn(authErrorHandler, 'catch');
                    return request(expressApp).get('/auth/login')
                        .expect(500)
                        .then(() => done())
                        .catch((error) => done.fail(error))
                })
                it('loginErrorHandler #catch should have been called', () => {
                    expect(loginErrorHandler.catch).toHaveBeenCalled();
                })
                it('authErrorHandler #catch should not have been called', () => {
                    expect(authErrorHandler.catch).not.toHaveBeenCalled();
                })
            })

            describe('and loginErrorHandler does not handle it', () => {
                beforeEach((done: DoneFn) => {
                    spyOn(loginErrorHandler, 'catch').and.callFake((error, req, res) => {
                        throw error;
                    });
                    spyOn(authErrorHandler, 'catch').and.callFake((error, req, res) => {
                        throw error;
                    });
                    spyOn(rootErrorHandler, 'catch').and.callFake((error, req, res) => {
                        res.status(500).end();
                    });

                    return request(expressApp).get('/auth/login')
                        .expect(500)
                        .then(() => done())
                        .catch((error) => done.fail(error))
                })
                it('catch should have been called', () => {
                    expect(loginErrorHandler.catch).toHaveBeenCalled();
                    expect(authErrorHandler.catch).toHaveBeenCalled();
                    expect(rootErrorHandler.catch).toHaveBeenCalled();
                })
            })


        })
    })

})