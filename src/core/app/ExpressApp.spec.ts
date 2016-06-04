
import {buildApp} from './ExpressApp';
import {CoreRouter} from '../router';
import {Global, inject, injectable, Filter, ErrorHandler} from '../../core';
import * as request from 'supertest-as-promised';
import * as express from 'express';

describe('ExpressApp', () => {

    @injectable()
    class AuthControllerMock {
        login(req, res: express.Response) {
            res.send(req.$thisFilter);
        }
        saveUser(req, res: express.Response) {
            res.send(req.$thisFilter);
        }
    }

    @injectable()
    class HttpFilterMock extends Filter<any> {
        apply(): void { return; }
    }

    @injectable()
    class LoginFilterMock extends Filter<any> {
        apply(): void { return; }
    }

    @injectable()
    class LoginErrorHandler extends ErrorHandler { }

    @injectable()
    class AuthErrorHandler extends ErrorHandler { }

    beforeAll(() => {
        Global.snapshot()
            .registerController('AuthController', AuthControllerMock)
            .registerFilter('LoginFilter', LoginFilterMock)
            .registerFilter('HttpFilter', HttpFilterMock)
            .registerErrorHandler('LoginErrorHandler', LoginErrorHandler)
            .registerErrorHandler('AuthErrorHandler', AuthErrorHandler);
    });

    afterAll(() => {
        Global.restore();
    })

    describe('#buildApp', () => {

        let routes = {
            "/auth": {
                "$errorHandlers": ["AuthErrorHandler"],
                "/login": {
                    "$filters": ["LoginFilter"],
                    "get": ["AuthController", "login"],
                    "$errorHandlers": ["LoginErrorHandler"],
                    "/user": {
                        "$filters": ["HttpFilter"],
                        "post": ["AuthController", "saveUser"]
                    }
                }
            }
        };
        let expressRouter: express.Router;
        let coreRouter: CoreRouter;
        let expressApp: express.Application;

        beforeAll(() => {
            coreRouter = new CoreRouter(routes);
            expressApp = buildApp(coreRouter.getRoutesConfiguration());
        })

        describe('when we got a valid express app', () => {

            let authController: AuthControllerMock;
            let httpFilter: Filter<any>;
            let loginFilter: Filter<any>;
            let loginErrorHandler: ErrorHandler;
            let authErrorHandler: ErrorHandler;

            beforeEach(() => {
                authController = Global.getController<AuthControllerMock>('AuthController');
                httpFilter = Global.getFilter<any>('HttpFilter');
                loginFilter = Global.getFilter<any>('LoginFilter');
                loginErrorHandler = Global.getErrorHandler('LoginErrorHandler');
                authErrorHandler = Global.getErrorHandler('AuthErrorHandler');
            })

            describe('GET /auth/login', () => {

                beforeEach((done: DoneFn) => {
                    spyOn(authController, 'saveUser').and.callThrough();
                    spyOn(authController, 'login').and.callThrough();
                    spyOn(httpFilter, 'apply').and.callThrough();
                    spyOn(loginFilter, 'apply').and.callThrough();

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
                    expect(loginFilter.apply).toHaveBeenCalled();
                    expect(httpFilter.apply).not.toHaveBeenCalled();
                })

            })

            describe('POST /auth/login/user', () => {

                beforeEach((done: DoneFn) => {
                    spyOn(authController, 'saveUser').and.callThrough();
                    spyOn(authController, 'login').and.callThrough();
                    spyOn(httpFilter, 'apply').and.callThrough();
                    spyOn(loginFilter, 'apply').and.callThrough();

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
                    expect(loginFilter.apply).toHaveBeenCalled();
                    expect(httpFilter.apply).toHaveBeenCalled();
                })

            })

            describe('and a controller throws an error', () => {
                beforeEach(() => {
                    spyOn(authController, 'login').and.throwError('Error on controller.');
                })
                describe('and loginErrorHandler handles it', () => {
                    beforeEach((done: DoneFn) => {
                        spyOn(authErrorHandler, 'catch').and.throwError('Error');
                        spyOn(loginErrorHandler, 'catch').and.callFake((error, req, res) => {
                            res.status(500).send('Error');
                        })
                        return request(expressApp).get('/auth/login')
                            .expect(500)
                            .then(() => done())
                            .catch((error) => done.fail(error))
                    })
                    it('catch should have been called', () => {
                        expect(loginErrorHandler.catch).toHaveBeenCalled();
                    })
                    it('authErrorHandler should not have been called', () => {
                        expect(authErrorHandler.catch).not.toHaveBeenCalled();
                    })
                })
                
                describe('and loginErrorHandler does not handle it', () => {
                    beforeEach((done: DoneFn) => {
                        spyOn(loginErrorHandler, 'catch').and.callFake((error, req, res) => {
                            throw error;
                        });
                        spyOn(authErrorHandler, 'catch').and.callFake((error, req, res) => {
                           res.status(500).send('Error'); 
                        });
                        
                        return request(expressApp).get('/auth/login')
                            .expect(500)
                            .then(() => done())
                            .catch((error) => done.fail(error))
                    })
                    it('catch should have been called', () => {
                        expect(loginErrorHandler.catch).toHaveBeenCalled();
                    })
                    it('authErrorHandler should have been called', () => {
                        expect(authErrorHandler.catch).toHaveBeenCalled();
                    })
                })


            })
        })
    })

})

/*let userRouter = express.Router();
        let infoRouter = express.Router();
        let app = express();
        
        let fn = (req, res: express.Response, next) => { next(); };
        
        userRouter.route('/')
            .post(fn)
            .get(fn)
            .put(fn);
            
       infoRouter.route('/')
            .post(fn)
            .get(fn)
            .put(fn);
        
        userRouter.use('/info', infoRouter);
        
        app.use('/user', userRouter);*/
