import {injectable} from '../../core';
import {ExpressServer} from '../../server';
import * as request from 'supertest-as-promised';
import * as express from 'express';

describe('ExpressServer params', () => {
    let server = new ExpressServer();
    beforeEach(() => {
        server.snapshot();
    });
    afterEach(() => {
        server.restore();
    });

    describe('given a route tree with parameters', () => {
        @injectable()
        class TestController {
            get(): void { }
        }
        let app: express.Application;
        beforeEach(() => {
            server
                .setRoutes({
                    '/api': {
                        '/user/:user_id': {
                            'get': ['TestController', 'get'],
                            '/address/:address_id': {
                                'get': ['TestController', 'get']
                            }
                        }
                    }
                })
                .setController('TestController', TestController);
        });

        describe('when I call a route with params', () => {
            let params: any;
            beforeEach(() => {
                spyOn(server.component<TestController>('TestController'), 'get')
                    .and.callFake((req: express.Request, res: express.Response) => {
                        params = req.params;
                        res.status(200).end();
                    });
            });
            describe('/api/user/1', () => {
                beforeEach((done: DoneFn) => {
                    request(server.getApp())
                        .get('/api/user/1')
                        .expect(200)
                        .then(() => done())
                        .catch((error: any) => done.fail(error))
                })
                it('user_id parameter should be 1', () => {
                    expect(params.user_id).toEqual('1');
                });
            });

            describe('when i call /api/user/1/address/2', () => {
                beforeEach((done: DoneFn) => {
                    request(server.getApp())
                        .get('/api/user/1/address/2')
                        .expect(200)
                        .then(() => done())
                        .catch((error: any) => done.fail(error))
                })
                it('user_id parameter should be 1', () => {
                    expect(params.user_id).toEqual('1');
                });
                it('address_id parameter should be 2', () => {
                    expect(params.address_id).toEqual('2');
                });
            });
        });
    });
});