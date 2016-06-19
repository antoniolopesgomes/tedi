import {
    App,
    Filter,
    Module,
    BindingContext,
    inject,
    injectable,
    Logger
} from '../core';
import {ExpressServer, ExpressApp} from '../server/express';

import * as express from 'express';
import * as request from 'supertest-as-promised';

describe('Modules', () => {

    let server = new ExpressServer();

    @injectable()
    class AuthController {
        get(req, res): void {
            res.status(200).end();
        };
    }

    @injectable()
    class CustomFilter extends Filter<any> { }

    @injectable()
    class AuthModule extends Module {
        init(): void {
            this
                .setRoutesDefinition({
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
        let authModule: Module;

        beforeEach(() => {
            server
                .setRoutesDefinition({
                    '/auth': 'AuthModule'
                })
                .addChildModule('AuthModule', AuthModule);

            app = server.component<ExpressApp>(<any>App).getApp();
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
                expect(authModule.component(Logger)).toEqual(jasmine.any(Logger));
            });

            describe('and override an internal component', () => {
                @injectable()
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