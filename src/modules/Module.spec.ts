import {
    App,
    Filter,
    Module,
    BindingContext,
    inject,
    injectable
} from '../core';
import {ExpressServer, ExpressApp} from '../server/express';

import * as express from 'express';
import * as request from 'supertest-as-promised';


describe('Modules', () => {

    let server =  new ExpressServer();

    @injectable()
    class AuthController {
        get(req, res): void {
            res.status(200).end();
        };
    }

    @injectable()
    class CustomFilter extends Filter<any> { }

    let authModule = new Module()
        .setRoutesDefinition({
            '/login': {
                '$filters': ['RootFilter'],
                'get': ['AuthController', 'get']
            }
        })
        .setController('AuthController', AuthController)
        .setFilter('RootFilter', new CustomFilter(), { context: BindingContext.VALUE });

    describe('Modules', () => {
        beforeEach(() => {
            server.snapshot();
        })
        afterEach(() => {
            server.restore();
        })
        describe('an app with a module', () => {

            let app: express.Application;

            beforeEach(() => {
                server
                    .setRoutesDefinition({
                        '/auth': 'AuthModule'
                    })
                    .addChildModule('AuthModule', authModule);

                app = server.component<ExpressApp>(<any>App).getApp();
            });

            describe('/auth/login', () => {
                let authModule: Module;
                beforeEach((done: DoneFn) => {
                    authModule = server.childModule('AuthModule');
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

            describe('when we try to override the controller', () => {
                
                @injectable()
                class CustomAuthController {
                    get(req, res): void {
                        res.status(200).end();
                    }
                }

                beforeEach(() => {
                    authModule.setController('AuthController', CustomAuthController);
                })

                it('should have override AuthController', () => {
                    expect(authModule.controller('AuthController')).toEqual(jasmine.any(CustomAuthController));
                })

            });
        });
    })
})