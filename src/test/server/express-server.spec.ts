
import * as request from 'supertest-as-promised';
import * as express from 'express';
import {
    BindingContext,
    BaseFilter,
    FilterError,
    BaseErrorHandler,
    ErrorHandlerError,
    ActionError,
    Controller, Filter, ErrorHandler, dependency
} from '../../core';
import {Logger, LoggerLevels} from '../../logger';
import {ExpressServer} from '../../server';
import {Route, RouteAction, RouteFilter, RouteErrorHandler} from '../../lib/router';

describe('ExpressServer', () => {

    let server: ExpressServer;

    @Controller()
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

    @Filter()
    class CustomFilter implements BaseFilter<any> {
        apply(req: express.Request, res: express.Response): any { }
        getDataFromRequest(req: express.Request): any { }
    }

    @ErrorHandler()
    class CustomErrorHandler implements BaseErrorHandler {
        catch(err: any) {
            throw err;
        }
    }

    beforeEach(() => {
        server = new ExpressServer();
    });

    describe('when we have a valid app', () => {

        let expressApp: express.Application;

        beforeEach(() => {
            server
                .setJsonRoutes({
                    "$errorHandlers": ["RootErrorHandler"],
                    "$filters": ["RootFilter"],
                    "/auth": {
                        "$errorHandlers": ["AuthErrorHandler"],
                        "/login": {
                            "$filters": ["LoginFilter", "AfterLoginFilter"],
                            "$errorHandlers": ["LoginErrorHandler", "AfterLoginErrorHandler"],
                            "get": [AuthController, "login"],
                            "/user": {
                                "$filters": ["UserFilter"],
                                "post": [AuthController, "saveUser"]
                            },
                            "/admin": {
                                "$filters": ["AdminFilter"],
                                "post": [AuthController, "saveAdmin"]
                            }
                        }
                    }
                })
                .dependencies(
                    AuthController,
                    dependency('RootFilter', { class: CustomFilter }),
                    dependency('LoginFilter', { class: CustomFilter }),
                    dependency('AfterLoginFilter', { class: CustomFilter }),
                    dependency('UserFilter', { class: CustomFilter }),
                    dependency('AdminFilter', { class: CustomFilter }),
                    dependency('RootErrorHandler', { class: CustomErrorHandler }),
                    dependency('LoginErrorHandler', { class: CustomErrorHandler }),
                    dependency('AfterLoginErrorHandler', { class: CustomErrorHandler }),
                    dependency('AuthErrorHandler', { class: CustomErrorHandler })
                );

            expressApp = server.getApp();
            server.getDependency<Logger>('Logger').setLevel(LoggerLevels.EMERGENCY);
        })

        describe('GET /auth/login', () => {

            beforeEach((done: DoneFn) => {
                spyOn(server.getDependency(AuthController), 'saveUser').and.callThrough();
                spyOn(server.getDependency(AuthController), 'login').and.callThrough();
                spyOn(server.getDependency('UserFilter'), 'apply').and.callThrough();
                spyOn(server.getDependency('RootFilter'), 'apply').and.callThrough();
                spyOn(server.getDependency('LoginFilter'), 'apply').and.callThrough();
                spyOn(server.getDependency('AfterLoginFilter'), 'apply').and.callThrough();
                spyOn(server.getDependency('AdminFilter'), 'apply').and.callThrough();

                server.getDependency<Logger>('Logger').setLevel(LoggerLevels.DEBUG);

                return request(expressApp).get('/auth/login')
                    .expect(200)
                    .then(() => done())
                    .catch((error) => done.fail(error))
            })

            it('should have called the right controllers', () => {
                expect(server.getDependency<AuthController>(AuthController).login).toHaveBeenCalled();
                expect(server.getDependency<AuthController>(AuthController).saveUser).not.toHaveBeenCalled();
            })

            it('should have called the right filters', () => {
                expect(server.getDependency<BaseFilter<any>>('RootFilter').apply).toHaveBeenCalled();
                expect(server.getDependency<BaseFilter<any>>('LoginFilter').apply).toHaveBeenCalled();
                expect(server.getDependency<BaseFilter<any>>('AfterLoginFilter').apply).toHaveBeenCalled();
                expect(server.getDependency<BaseFilter<any>>('UserFilter').apply).not.toHaveBeenCalled();
                expect(server.getDependency<BaseFilter<any>>('AdminFilter').apply).not.toHaveBeenCalled();
            })

        })

        describe('POST /auth/login/user', () => {

            beforeEach((done: DoneFn) => {
                spyOn(server.getDependency(AuthController), 'saveUser').and.callThrough();
                spyOn(server.getDependency(AuthController), 'login').and.callThrough();
                spyOn(server.getDependency('RootFilter'), 'apply').and.callThrough();
                spyOn(server.getDependency('UserFilter'), 'apply').and.callThrough();
                spyOn(server.getDependency('LoginFilter'), 'apply').and.callThrough();
                spyOn(server.getDependency('AdminFilter'), 'apply').and.callThrough();

                return request(expressApp).post('/auth/login/user')
                    .expect(200)
                    .then(() => done())
                    .catch((error) => done.fail(error))
            })

            it('should have called the right controllers', () => {
                expect(server.getDependency<AuthController>(AuthController).saveUser).toHaveBeenCalled();
                expect(server.getDependency<AuthController>(AuthController).login).not.toHaveBeenCalled();
            })

            it('should have called the right filters', () => {
                expect(server.getDependency<BaseFilter<any>>('RootFilter').apply).toHaveBeenCalled();
                expect(server.getDependency<BaseFilter<any>>('LoginFilter').apply).toHaveBeenCalled();
                expect(server.getDependency<BaseFilter<any>>('UserFilter').apply).toHaveBeenCalled();
                expect(server.getDependency<BaseFilter<any>>('AdminFilter').apply).not.toHaveBeenCalled();
            })

        })

        describe('with nested filters', () => {
            let filterQueue: string[];
            beforeEach((done: DoneFn) => {
                filterQueue = [];
                spyOn(server.getDependency('RootFilter'), 'apply').and.callFake(() => {
                    filterQueue.push('RootFilter');
                })
                spyOn(server.getDependency('LoginFilter'), 'apply').and.callFake(() => {
                    filterQueue.push('LoginFilter');
                })
                spyOn(server.getDependency('AfterLoginFilter'), 'apply').and.callFake(() => {
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
                spyOn(server.getDependency(AuthController), 'login').and.throwError('Error on controller.');
            });
            describe('and loginErrorHandler handles it', () => {
                let catchedError: any;
                beforeEach((done: DoneFn) => {
                    spyOn(server.getDependency('LoginErrorHandler'), 'catch').and.callFake((error, req, res) => {
                        catchedError = error;
                        res.status(500).send('Error');
                    })
                    spyOn(server.getDependency('AuthErrorHandler'), 'catch');
                    return request(expressApp).get('/auth/login')
                        .expect(500)
                        .then(() => done())
                        .catch((error) => done.fail(error))
                })
                it('loginErrorHandler #catch should have been called', () => {
                    expect(server.getDependency<BaseErrorHandler>('LoginErrorHandler').catch).toHaveBeenCalled();
                })
                it('catchedError should be an ActionError', () => {
                    expect(catchedError).toEqual(jasmine.any(ActionError));
                })
                it('authErrorHandler #catch should not have been called', () => {
                    expect(server.getDependency<BaseErrorHandler>('AuthErrorHandler').catch).not.toHaveBeenCalled();
                })
            });
            describe('and only RootErrorHandler handles it', () => {
                let errorHandlers: string[];
                beforeEach((done: DoneFn) => {
                    errorHandlers = [];
                    spyOn(server.getDependency('AfterLoginErrorHandler'), 'catch').and.callFake((error, req, res) => {
                        errorHandlers.push('AfterLoginErrorHandler');
                        throw error;
                    });
                    spyOn(server.getDependency('LoginErrorHandler'), 'catch').and.callFake((error, req, res) => {
                        errorHandlers.push('LoginErrorHandler');
                        throw error;
                    });
                    spyOn(server.getDependency('AuthErrorHandler'), 'catch').and.callFake((error, req, res) => {
                        errorHandlers.push('AuthErrorHandler');
                        throw error;
                    });
                    spyOn(server.getDependency('RootErrorHandler'), 'catch').and.callFake((error, req, res) => {
                        errorHandlers.push('RootErrorHandler');
                        res.status(500).end();
                    });

                    return request(expressApp).get('/auth/login')
                        .expect(500)
                        .then(() => done())
                        .catch((error) => done.fail(error))
                })
                it('all error handlers should be called', () => {
                    expect(server.getDependency<BaseErrorHandler>('AfterLoginErrorHandler').catch).toHaveBeenCalled();
                    expect(server.getDependency<BaseErrorHandler>('LoginErrorHandler').catch).toHaveBeenCalled();
                    expect(server.getDependency<BaseErrorHandler>('AuthErrorHandler').catch).toHaveBeenCalled();
                    expect(server.getDependency<BaseErrorHandler>('RootErrorHandler').catch).toHaveBeenCalled();
                });
                it('error handlers should have been called in the right order', () => {
                    expect(errorHandlers).toEqual([
                        'LoginErrorHandler',
                        'AfterLoginErrorHandler',
                        'AuthErrorHandler',
                        'RootErrorHandler'
                    ]);
                });
            });
        });

        describe('and LoginFilter throws an error', () => {
            let catchedError: any;
            beforeEach((done: DoneFn) => {
                spyOn(server.getDependency('LoginFilter'), 'apply').and.callFake(() => {
                    throw new Error('Filter error');
                });
                spyOn(server.getDependency('RootErrorHandler'), 'catch').and.callFake((err: any, req, res: express.Response) => {
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
                spyOn(server.getDependency(AuthController), 'login');
                spyOn(server.getDependency('LoginFilter'), 'apply').and.callFake((req, res) => {
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
                expect(server.getDependency<BaseFilter<any>>('LoginFilter').apply).toHaveBeenCalled();
                expect(response.text).toEqual('HIJACKED');
            });
            it('controller should have not been called', () => {
                expect(server.getDependency<AuthController>(AuthController).login).not.toHaveBeenCalled();
            });
        });
    })

})