import {Server, injectable, BindingContext} from '../../Server';
import {App} from '../../core';
import {ExpressApp} from '../../app/express';
import {BodyParserFilter} from './BodyParserFilter';
import * as express from 'express';
import * as request from 'supertest-as-promised';

describe('BodyParserFilter', () => {

    @injectable()
    class DummyController {
        post(req, res): void {
            return res.status(200).end();
        }
    } 

    beforeEach(() => {
        Server.snapshot().setRoutesJSON({
            '/parser': {
                '$filters': ['JSONBodyParser'],
                'post': ['DummyController', 'post']
            }
        })
        .addController('DummyController', DummyController);
    })
    afterEach(() => {
        Server.restore()
    })

    describe('JSON body parser', () => {
        let app: express.Application;
        let requestBody: any = {
            id: 'dummy_id'
        };
        let parsedBody: any;
        beforeEach((done: DoneFn) => {
            //add filter
            Server.addFilter('JSONBodyParser', new BodyParserFilter(BodyParserFilter.ParserTypes.JSON), {context: BindingContext.VALUE})
            //get express app
            app = Server.component<ExpressApp>(<any> App).getApp();
            //spy on controller
            spyOn(Server.controller('DummyController'), 'post').and.callFake((req, res) => {
                parsedBody = req.body;
                res.status(200).end();
            });
            //request
            request(app)
                .post('/parser')
                .send(requestBody)
                .expect(200)
                .then(() => done())
                .catch((error) => done.fail(error));
        })
        it('should have parsed the body', () => {
            expect(parsedBody).toEqual(requestBody);
        })
    })

});