
import {ExpressAppBuilder} from './ExpressAppBuilder';
import {Router} from '../../router';
import {Logger, LoggerLevels} from '../../logging';
import {Server, inject, injectable, BindingContext} from '../../Server';
import {Filter, ErrorHandler, ActionError, FilterError} from '../../core';
import * as request from 'supertest-as-promised';
import * as express from 'express';

describe('ExpressAppBuilder', () => {

    @injectable()
    class AuthController {
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
    class CustomErrorHandler extends ErrorHandler { 
        catch(err: any) {
            throw err;
        }
    }

    beforeEach(() => {
        Server.snapshot();
    });

    afterEach(() => {
        Server.restore();
    })

    describe('when we have a valid app', () => {

        let router: Router;
        let expressAppBuilder: ExpressAppBuilder;
        let expressApp: express.Application;

        beforeEach(() => {
            Server
                .setRoutesJSON({
                    "$errorHandlers": ["RootErrorHandler"],
                    "$filters": ["RootFilter"],
                    "/auth": {
                        "$errorHandlers": ["AuthErrorHandler"],
                        "/login": {
                            "$filters": ["LoginFilter", "AfterLoginFilter"],
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
                })
                .addController('AuthController', AuthController)
                .addFilter('RootFilter', new CustomFilter(), { context: BindingContext.VALUE })
                .addFilter('LoginFilter', new CustomFilter(), { context: BindingContext.VALUE })
                .addFilter('AfterLoginFilter', new CustomFilter(), { context: BindingContext.VALUE })
                .addFilter('UserFilter', new CustomFilter(), { context: BindingContext.VALUE })
                .addFilter('AdminFilter', new CustomFilter(), { context: BindingContext.VALUE })
                .addErrorHandler('RootErrorHandler', new CustomErrorHandler(), { context: BindingContext.VALUE })
                .addErrorHandler('LoginErrorHandler', new CustomErrorHandler(), { context: BindingContext.VALUE })
                .addErrorHandler('AuthErrorHandler', new CustomErrorHandler(), { context: BindingContext.VALUE });

            router = Server.component(Router);
            expressAppBuilder = Server.component(ExpressAppBuilder);
            expressApp = expressAppBuilder.buildApp(router.getRoot());

            Server.component<Logger>(Logger).setLevel(LoggerLevels.EMERGENCY);
        })

        describe('GET /auth/login', () => {

            beforeEach((done: DoneFn) => {
                spyOn(Server.controller('AuthController'), 'saveUser').and.callThrough();
                spyOn(Server.controller('AuthController'), 'login').and.callThrough();
                spyOn(Server.filter('UserFilter'), 'apply').and.callThrough();
                spyOn(Server.filter('RootFilter'), 'apply').and.callThrough();
                spyOn(Server.filter('LoginFilter'), 'apply').and.callThrough();
                spyOn(Server.filter('AfterLoginFilter'), 'apply').and.callThrough();
                spyOn(Server.filter('AdminFilter'), 'apply').and.callThrough();

                Server.component<Logger>(Logger).setLevel(LoggerLevels.DEBUG);

                return request(expressApp).get('/auth/login')
                    .expect(200)
                    .then(() => done())
                    .catch((error) => done.fail(error))
            })

            it('should have called the right controllers', () => {
                expect(Server.controller<AuthController>('AuthController').login).toHaveBeenCalled();
                expect(Server.controller<AuthController>('AuthController').saveUser).not.toHaveBeenCalled();
            })

            it('should have called the right filters', () => {
                expect(Server.filter('RootFilter').apply).toHaveBeenCalled();
                expect(Server.filter('LoginFilter').apply).toHaveBeenCalled();
                expect(Server.filter('AfterLoginFilter').apply).toHaveBeenCalled();
                expect(Server.filter('UserFilter').apply).not.toHaveBeenCalled();
                expect(Server.filter('AdminFilter').apply).not.toHaveBeenCalled();
            })

        })

        describe('POST /auth/login/user', () => {

            beforeEach((done: DoneFn) => {
                spyOn(Server.controller('AuthController'), 'saveUser').and.callThrough();
                spyOn(Server.controller('AuthController'), 'login').and.callThrough();
                spyOn(Server.filter('RootFilter'), 'apply').and.callThrough();
                spyOn(Server.filter('UserFilter'), 'apply').and.callThrough();
                spyOn(Server.filter('LoginFilter'), 'apply').and.callThrough();
                spyOn(Server.filter('AdminFilter'), 'apply').and.callThrough();

                return request(expressApp).post('/auth/login/user')
                    .expect(200)
                    .then(() => done())
                    .catch((error) => done.fail(error))
            })

            it('should have called the right controllers', () => {
                expect(Server.controller<AuthController>('AuthController').saveUser).toHaveBeenCalled();
                expect(Server.controller<AuthController>('AuthController').login).not.toHaveBeenCalled();
            })

            it('should have called the right filters', () => {
                expect(Server.filter('RootFilter').apply).toHaveBeenCalled();
                expect(Server.filter('LoginFilter').apply).toHaveBeenCalled();
                expect(Server.filter('UserFilter').apply).toHaveBeenCalled();
                expect(Server.filter('AdminFilter').apply).not.toHaveBeenCalled();
            })

        })

        describe('with nested filters', () => {
            let filterQueue: string[];
            beforeEach((done: DoneFn) => {
                filterQueue = [];
                spyOn(Server.filter('RootFilter'), 'apply').and.callFake(() => {
                    filterQueue.push('RootFilter');
                })
                spyOn(Server.filter('LoginFilter'), 'apply').and.callFake(() => {
                    filterQueue.push('LoginFilter');
                })
                spyOn(Server.filter('AfterLoginFilter'), 'apply').and.callFake(() => {
                    filterQueue.push('AfterLoginFilter');
                })

                return request(expressApp).get('/auth/login')
                    .expect(200)
                    .then(() => done())
                    .catch((error) => done.fail(error))
            });
            it('filters should be called in the right order', () => {
                expect(filterQueue).toEqual(['RootFilter', 'LoginFilter', 'AfterLoginFilter']);
            });
        })

        describe('and a controller throws an error', () => {
            beforeEach(() => {
                spyOn(Server.controller('AuthController'), 'login').and.throwError('Error on controller.');
            });
            describe('and loginErrorHandler handles it', () => {
                let catchedError: any;
                beforeEach((done: DoneFn) => {
                    spyOn(Server.errorHandler('LoginErrorHandler'), 'catch').and.callFake((error, req, res) => {
                        catchedError = error;
                        res.status(500).send('Error');
                    })
                    spyOn(Server.errorHandler('AuthErrorHandler'), 'catch');
                    return request(expressApp).get('/auth/login')
                        .expect(500)
                        .then(() => done())
                        .catch((error) => done.fail(error))
                })
                it('loginErrorHandler #catch should have been called', () => {
                    expect(Server.errorHandler('LoginErrorHandler').catch).toHaveBeenCalled();
                })
                it('catchedError should be an ActionError', () => {
                    expect(catchedError).toEqual(jasmine.any(ActionError));
                })
                it('authErrorHandler #catch should not have been called', () => {
                    expect(Server.errorHandler('AuthErrorHandler').catch).not.toHaveBeenCalled();
                })
            });
            describe('and loginErrorHandler does not handle it', () => {
                beforeEach((done: DoneFn) => {
                    spyOn(Server.errorHandler('LoginErrorHandler'), 'catch').and.callFake((error, req, res) => {
                        throw error;
                    });
                    spyOn(Server.errorHandler('AuthErrorHandler'), 'catch').and.callFake((error, req, res) => {
                        throw error;
                    });
                    spyOn(Server.errorHandler('RootErrorHandler'), 'catch').and.callFake((error, req, res) => {
                        res.status(500).end();
                    });

                    return request(expressApp).get('/auth/login')
                        .expect(500)
                        .then(() => done())
                        .catch((error) => done.fail(error))
                })
                it('catch should have been called', () => {
                    expect(Server.errorHandler('LoginErrorHandler').catch).toHaveBeenCalled();
                    expect(Server.errorHandler('AuthErrorHandler').catch).toHaveBeenCalled();
                    expect(Server.errorHandler('RootErrorHandler').catch).toHaveBeenCalled();
                })
            });
        });

        describe('and LoginFilter throws an error', () => {
            let catchedError: any;
            beforeEach((done: DoneFn) => {
                spyOn(Server.filter('LoginFilter'), 'apply').and.callFake(() => {
                    throw new Error('Filter error');
                });
                spyOn(Server.errorHandler('RootErrorHandler'), 'catch').and.callFake((err: any, req, res: express.Response) => {
                    catchedError = err;
                    res.status(500).end();
                })
                return request(expressApp).get('/auth/login')
                    .expect(500)
                    .then(() => done())
                    .catch((error) => done.fail(error))
            });
            it('catchedError should be a FilterError', () => {
                expect(catchedError).toEqual(jasmine.any(FilterError));
            })
        });

        describe('and a login filter responds', () => {
            let response: request.Response;
            beforeEach((done) => {
                spyOn(Server.controller('AuthController'), 'login');
                spyOn(Server.filter('LoginFilter'), 'apply').and.callFake((req, res) => {
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

            });
            it('filter should have responded', () => {
                expect(Server.filter('LoginFilter').apply).toHaveBeenCalled();
                expect(response.text).toEqual('HIJACKED');
            });
            it('controller should have not been called', () => {
                expect(Server.controller<AuthController>('AuthController').login).not.toHaveBeenCalled();
            });
        });
    })

})