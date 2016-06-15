import {Server, IServerRegistry, injectable, BindingContext} from '../Server';
import {App} from '../app';
import {ExpressApp} from '../app/express';
import {Module} from './core';
import {Filter} from '../core';
import * as express from 'express';
import * as request from 'supertest-as-promised';

describe('Modules', () => {

    @injectable()
    class AuthController {
        get(req, res): void {
            res.status(200).end();
        };
    }

    @injectable()
    class CustomFilter extends Filter<any> {}

    @injectable()
    class AuthModule extends Module {
        getRawRouteDefinition(): any {
            return {
                '/login': {
                    '$filters': ['auth.RootFilter'],
                    'get': ['auth.AuthController', 'get']
                }
            }
        }
        registerComponents(server: IServerRegistry): any {
            server
                .addController('auth.AuthController', AuthController)
                .addFilter('auth.RootFilter', new CustomFilter(), { context: BindingContext.VALUE });
        }
    }

    describe('Modules', () => {
        beforeEach(() => {
            Server.snapshot();
        })
        afterEach(() => {
            Server.restore();
        })
        describe('an app with a module', () => {

            let app: express.Application;

            beforeEach(() => {
                Server
                    .setRoutesJSON({
                        '/auth': 'AuthModule'
                    })
                    .addModule('AuthModule', AuthModule);

                app = Server.component<ExpressApp>(<any>App).getApp();
            });

            describe('/auth/login', () => {
                beforeEach((done: DoneFn) => {
                    spyOn(Server.controller('auth.AuthController'), 'get').and.callThrough();
                    spyOn(Server.filter('auth.RootFilter'), 'apply').and.callFake(() => {
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
                    expect(Server.controller<AuthController>('auth.AuthController').get).toHaveBeenCalled();
                });

                it('should have called the module auth.RootFilter', () => {
                    expect(Server.filter('auth.RootFilter').apply).toHaveBeenCalled();
                });

            })



        });


    })

})