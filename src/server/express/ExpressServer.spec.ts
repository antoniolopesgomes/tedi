import {inject, injectable, BindingContext} from '../../modules';
import {Router} from '../../router';
import {Logger, LoggerLevels} from '../../logging';
import {Filter, FilterError} from '../../filters';
import {ErrorHandler, ErrorHandlerError} from '../../errors';
import {ActionError} from '../../controllers';
import {RouteDefinition, RouteAction, RouteFilter, RouteErrorHandler} from '../../router';
import {ExpressApp} from './ExpressApp';
import {ExpressServer} from './ExpressServer';
import * as request from 'supertest-as-promised';
import * as express from 'express';

describe('ExpressServer', () => {

    let server = new ExpressServer();

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
    class CustomFilter implements Filter<any> {
        apply(req: express.Request, res: express.Response): any { }
        getDataFromRequest(req: express.Request): any { }
    }

    @injectable()
    class CustomErrorHandler implements ErrorHandler {
        catch(err: any) {
            throw err;
        }
    }

    beforeEach(() => {
        server.snapshot();
    });

    afterEach(() => {
        server.restore();
    })

    describe('when we have a valid app', () => {

        let router: Router;
        let expressApp: express.Application;

        beforeEach(() => {
            server
                .setRoutesDefinition({
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
                .setController('AuthController', AuthController)
                .setFilter('RootFilter', new CustomFilter(), { context: BindingContext.VALUE })
                .setFilter('LoginFilter', new CustomFilter(), { context: BindingContext.VALUE })
                .setFilter('AfterLoginFilter', new CustomFilter(), { context: BindingContext.VALUE })
                .setFilter('UserFilter', new CustomFilter(), { context: BindingContext.VALUE })
                .setFilter('AdminFilter', new CustomFilter(), { context: BindingContext.VALUE })
                .setErrorHandler('RootErrorHandler', new CustomErrorHandler(), { context: BindingContext.VALUE })
                .setErrorHandler('LoginErrorHandler', new CustomErrorHandler(), { context: BindingContext.VALUE })
                .setErrorHandler('AuthErrorHandler', new CustomErrorHandler(), { context: BindingContext.VALUE });

            expressApp = server.getApp();
            server.component<Logger>('Logger').setLevel(LoggerLevels.EMERGENCY);
        })

        describe('GET /auth/login', () => {

            beforeEach((done: DoneFn) => {
                spyOn(server.controller('AuthController'), 'saveUser').and.callThrough();
                spyOn(server.controller('AuthController'), 'login').and.callThrough();
                spyOn(server.filter('UserFilter'), 'apply').and.callThrough();
                spyOn(server.filter('RootFilter'), 'apply').and.callThrough();
                spyOn(server.filter('LoginFilter'), 'apply').and.callThrough();
                spyOn(server.filter('AfterLoginFilter'), 'apply').and.callThrough();
                spyOn(server.filter('AdminFilter'), 'apply').and.callThrough();

                server.component<Logger>('Logger').setLevel(LoggerLevels.DEBUG);

                return request(expressApp).get('/auth/login')
                    .expect(200)
                    .then(() => done())
                    .catch((error) => done.fail(error))
            })

            it('should have called the right controllers', () => {
                expect(server.controller<AuthController>('AuthController').login).toHaveBeenCalled();
                expect(server.controller<AuthController>('AuthController').saveUser).not.toHaveBeenCalled();
            })

            it('should have called the right filters', () => {
                expect(server.filter('RootFilter').apply).toHaveBeenCalled();
                expect(server.filter('LoginFilter').apply).toHaveBeenCalled();
                expect(server.filter('AfterLoginFilter').apply).toHaveBeenCalled();
                expect(server.filter('UserFilter').apply).not.toHaveBeenCalled();
                expect(server.filter('AdminFilter').apply).not.toHaveBeenCalled();
            })

        })

        describe('POST /auth/login/user', () => {

            beforeEach((done: DoneFn) => {
                spyOn(server.controller('AuthController'), 'saveUser').and.callThrough();
                spyOn(server.controller('AuthController'), 'login').and.callThrough();
                spyOn(server.filter('RootFilter'), 'apply').and.callThrough();
                spyOn(server.filter('UserFilter'), 'apply').and.callThrough();
                spyOn(server.filter('LoginFilter'), 'apply').and.callThrough();
                spyOn(server.filter('AdminFilter'), 'apply').and.callThrough();

                return request(expressApp).post('/auth/login/user')
                    .expect(200)
                    .then(() => done())
                    .catch((error) => done.fail(error))
            })

            it('should have called the right controllers', () => {
                expect(server.controller<AuthController>('AuthController').saveUser).toHaveBeenCalled();
                expect(server.controller<AuthController>('AuthController').login).not.toHaveBeenCalled();
            })

            it('should have called the right filters', () => {
                expect(server.filter('RootFilter').apply).toHaveBeenCalled();
                expect(server.filter('LoginFilter').apply).toHaveBeenCalled();
                expect(server.filter('UserFilter').apply).toHaveBeenCalled();
                expect(server.filter('AdminFilter').apply).not.toHaveBeenCalled();
            })

        })

        describe('with nested filters', () => {
            let filterQueue: string[];
            beforeEach((done: DoneFn) => {
                filterQueue = [];
                spyOn(server.filter('RootFilter'), 'apply').and.callFake(() => {
                    filterQueue.push('RootFilter');
                })
                spyOn(server.filter('LoginFilter'), 'apply').and.callFake(() => {
                    filterQueue.push('LoginFilter');
                })
                spyOn(server.filter('AfterLoginFilter'), 'apply').and.callFake(() => {
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
                spyOn(server.controller('AuthController'), 'login').and.throwError('Error on controller.');
            });
            describe('and loginErrorHandler handles it', () => {
                let catchedError: any;
                beforeEach((done: DoneFn) => {
                    spyOn(server.errorHandler('LoginErrorHandler'), 'catch').and.callFake((error, req, res) => {
                        catchedError = error;
                        res.status(500).send('Error');
                    })
                    spyOn(server.errorHandler('AuthErrorHandler'), 'catch');
                    return request(expressApp).get('/auth/login')
                        .expect(500)
                        .then(() => done())
                        .catch((error) => done.fail(error))
                })
                it('loginErrorHandler #catch should have been called', () => {
                    expect(server.errorHandler('LoginErrorHandler').catch).toHaveBeenCalled();
                })
                it('catchedError should be an ActionError', () => {
                    expect(catchedError).toEqual(jasmine.any(ActionError));
                })
                it('authErrorHandler #catch should not have been called', () => {
                    expect(server.errorHandler('AuthErrorHandler').catch).not.toHaveBeenCalled();
                })
            });
            describe('and loginErrorHandler does not handle it', () => {
                beforeEach((done: DoneFn) => {
                    spyOn(server.errorHandler('LoginErrorHandler'), 'catch').and.callFake((error, req, res) => {
                        throw error;
                    });
                    spyOn(server.errorHandler('AuthErrorHandler'), 'catch').and.callFake((error, req, res) => {
                        throw error;
                    });
                    spyOn(server.errorHandler('RootErrorHandler'), 'catch').and.callFake((error, req, res) => {
                        res.status(500).end();
                    });

                    return request(expressApp).get('/auth/login')
                        .expect(500)
                        .then(() => done())
                        .catch((error) => done.fail(error))
                })
                it('catch should have been called', () => {
                    expect(server.errorHandler('LoginErrorHandler').catch).toHaveBeenCalled();
                    expect(server.errorHandler('AuthErrorHandler').catch).toHaveBeenCalled();
                    expect(server.errorHandler('RootErrorHandler').catch).toHaveBeenCalled();
                })
            });
        });

        describe('and LoginFilter throws an error', () => {
            let catchedError: any;
            beforeEach((done: DoneFn) => {
                spyOn(server.filter('LoginFilter'), 'apply').and.callFake(() => {
                    throw new Error('Filter error');
                });
                spyOn(server.errorHandler('RootErrorHandler'), 'catch').and.callFake((err: any, req, res: express.Response) => {
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
                spyOn(server.controller('AuthController'), 'login');
                spyOn(server.filter('LoginFilter'), 'apply').and.callFake((req, res) => {
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
                expect(server.filter('LoginFilter').apply).toHaveBeenCalled();
                expect(response.text).toEqual('HIJACKED');
            });
            it('controller should have not been called', () => {
                expect(server.controller<AuthController>('AuthController').login).not.toHaveBeenCalled();
            });
        });
    })

})