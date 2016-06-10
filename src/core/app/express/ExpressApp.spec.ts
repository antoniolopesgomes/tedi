
import {buildApp} from './ExpressApp';
import {ExpressoRouter} from '../../router';
import {Global, inject, injectable, Filter, ErrorHandler, BindingContext} from '../../../core';
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
            .addController('AuthController', AuthControllerMock)
            .addFilter('RootFilter', new CustomFilter(), { context: BindingContext.VALUE })
            .addFilter('LoginFilter', new CustomFilter(), { context: BindingContext.VALUE })
            .addFilter('UserFilter', new CustomFilter(), { context: BindingContext.VALUE })
            .addFilter('AdminFilter', new CustomFilter(), { context: BindingContext.VALUE })
            .addErrorHandler('RootErrorHandler', new CustomErrorHandler(), { context: BindingContext.VALUE })
            .addErrorHandler('LoginErrorHandler', new CustomErrorHandler(), { context: BindingContext.VALUE })
            .addErrorHandler('AuthErrorHandler', new CustomErrorHandler(), { context: BindingContext.VALUE });

        authController = Global.controller<AuthControllerMock>('AuthController');
        rootFilter = Global.filter<any>('RootFilter');
        userFilter = Global.filter<any>('UserFilter');
        loginFilter = Global.filter<any>('LoginFilter');
        adminFilter = Global.filter<any>('AdminFilter');
        rootErrorHandler = Global.errorHandler('RootErrorHandler');
        loginErrorHandler = Global.errorHandler('LoginErrorHandler');
        authErrorHandler = Global.errorHandler('AuthErrorHandler');
    });

    afterEach(() => {
        Global.restore();
    })

    describe('when we have a valid app', () => {

        let expressApp: express.Application;

        beforeEach(() => {
            let coreRouter = new ExpressoRouter(routes);
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
                expect(rootFilter.apply).toHaveBeenCalled();
                expect(loginFilter.apply).toHaveBeenCalled();
                expect(userFilter.apply).not.toHaveBeenCalled();
                expect(adminFilter.apply).not.toHaveBeenCalled();
            })

        })

        describe('POST /auth/login/user', () => {

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

        describe('and a controller throws an error', () => {
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
        
        describe('when login filter responds', () => {
            let response: request.Response;
            beforeEach((done) => {
                spyOn(authController, 'login');
                spyOn(loginFilter, 'apply').and.callFake((req, res) => {
                    res.status(200).send('HIJACKED');
                });
                request(expressApp)
                    .get('/auth/login')
                    .expect(200)
                    .then((res: request.Response) => {
                        response = res;
                        done();
                    })
                    .catch(done.fail);
                    
            })
            it('filter should have responded', () => {
                expect(loginFilter.apply).toHaveBeenCalled();
                expect(response.text).toEqual('HIJACKED');
            })
            it('controller should have not been called', () => {
               expect(authController.login).not.toHaveBeenCalled(); 
            });
            
        })
    })

})