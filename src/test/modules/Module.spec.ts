
import {ExpressServer, ExpressApp} from '../../server';
import {
    BaseFilter,
    App,
    BaseModule,
    BindingContext,
    Controller,
    Filter,
    Module
} from '../../core'
import {Logger} from '../../logger';
import * as express from 'express';
import * as request from 'supertest-as-promised';

describe('Modules', () => {

    let server = new ExpressServer();

    @Controller()
    class AuthController {
        get(req, res): void {
            res.status(200).end();
        };
    }

    @Filter()
    class CustomFilter implements BaseFilter<any> {
        apply(req: express.Request, res: express.Response): any {

        }
        getDataFromRequest(req: express.Request): any {
            
        }
    }

    @Module()
    class AuthModule extends BaseModule {
        init(): void {
            this
                .setRoutes({
                    '/login': {
                        '$filters': ['RootFilter'],
                        'get': ['AuthController', 'get']
                    }
                })
                .setController('AuthController', AuthController)
                .setFilter('RootFilter', new CustomFilter(), { context: BindingContext.VALUE });
        }
    };

    beforeEach(() => {
        server.snapshot();
    })
    afterEach(() => {
        server.restore();
    })
    describe('When we got an app with a child module', () => {

        let app: express.Application;
        let authModule: BaseModule;

        beforeEach(() => {
            server
                .setRoutes({
                    '/auth': 'AuthModule'
                })
                .addChildModule('AuthModule', AuthModule);

            app = server.component<ExpressApp>('App').getApp();
            authModule = server.childModule('AuthModule');
        });

        describe('/auth/login', () => {
            beforeEach((done: DoneFn) => {
                spyOn(authModule.controller('AuthController'), 'get').and.callThrough();
                spyOn(authModule.filter('RootFilter'), 'apply').and.callFake(() => {
                    return;
                });
                request(app)
                    .get('/auth/login')
                    .expect(200)
                    .then(() => {
                        done();
                    })
                    .catch(done.fail)
            })

            it('should have called the module controller', () => {
                expect(authModule.controller<AuthController>('AuthController').get).toHaveBeenCalled();
            });

            it('should have called the module auth.RootFilter', () => {
                expect(authModule.filter('RootFilter').apply).toHaveBeenCalled();
            });
        });

        describe('and we try to access the child module', () => {
            it('should have a reference to the childModule', () => {
                expect(authModule).toEqual(jasmine.any(AuthModule));
            });
            it('childModule should have access to root module dependencies', () => {
                expect(authModule.component<Logger>('Logger')).not.toBeNull();
            });

            describe('and override an internal component', () => {
                @Controller()
                class CustomAuthController {
                    get(req, res): void {
                        res.status(200).end();
                    }
                }
                beforeEach(() => {
                    authModule.setController('AuthController', CustomAuthController);
                })
                it('should have overrided AuthController', () => {
                    expect(authModule.controller('AuthController')).toEqual(jasmine.any(CustomAuthController));
                })
            });
        });
    });
})