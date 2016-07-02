import {injectable} from '../../core';
import {ExpressServer} from '../../server';
import * as request from 'supertest-as-promised';
import * as express from 'express';

xdescribe('ExpressServer params', () => {
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
                        '/test/:id': {
                            '/test2/:id': {
                                'get': ['TestController', 'get']
                            }
                        }
                    }
                })
                .setController('TestController', TestController);
        });
        describe('when i call a route with params', () => {
            let req: express.Request;
            beforeEach((done: DoneFn) => {
                spyOn(server.component<TestController>('TestController'), 'get').and.callFake((_req: any, res:any) => {
                    req = _req;
                    res.status(200).end();
                });
                request(server.getApp())
                    .get('/api/test/444/test2/456')
                    .expect(200)
                    .then(() => {
                        done();
                    })
                    .catch((error: any) => {
                        done.fail(error);
                    })
            })
            it('should have parameters', () => {
                console.log(req.params);
            });
        });
    });





});