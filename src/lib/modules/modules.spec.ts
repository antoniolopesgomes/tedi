import {Server, IModule, injectable, BindingContext, Module} from '../Server';
import {App} from '../app';
import {ExpressApp} from '../app/express';
import {Filter} from '../core';
import * as express from 'express';
import * as request from 'supertest-as-promised';

fdescribe('Modules', () => {

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
        .addController('AuthController', AuthController)
        .addFilter('RootFilter', new CustomFilter(), { context: BindingContext.VALUE });

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
                    .setRoutesDefinition({
                        '/auth': 'AuthModule'
                    })
                    .addModule('AuthModule', authModule);

                app = Server.component<ExpressApp>(<any>App).getApp();
            });

            describe('/auth/login', () => {
                let authModule = Server.module('AuthModule');
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
                    expect(authModule.controller<AuthController>('auth.AuthController').get).toHaveBeenCalled();
                });

                it('should have called the module auth.RootFilter', () => {
                    expect(authModule.filter('auth.RootFilter').apply).toHaveBeenCalled();
                });

            })



        });


    })

})