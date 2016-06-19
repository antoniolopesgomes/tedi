import {
    Module, 
    injectable, 
    BindingContext,
    App
} from '../../core';
import {ExpressServer, ExpressApp} from '../../server/express';
import {BodyParserFilter} from '../../filters/body-parser';
import * as express from 'express';
import * as request from 'supertest-as-promised';

describe('BodyParserFilter', () => {

    let server = new ExpressServer();

    @injectable()
    class DummyController {
        post(req, res): void {
            return res.status(200).end();
        }
    } 

    beforeEach(() => {
        server.snapshot().setRoutesDefinition({
            '/parser': {
                '$filters': ['JSONBodyParser'],
                'post': ['DummyController', 'post']
            }
        })
        .setController('DummyController', DummyController);
    })
    afterEach(() => {
        server.restore()
    })

    describe('JSON body parser', () => {
        let app: express.Application;
        let requestBody: any = {
            id: 'dummy_id'
        };
        let parsedBody: any;
        beforeEach((done: DoneFn) => {
            //add filter
            server.setFilter(
                'JSONBodyParser', 
                new BodyParserFilter(BodyParserFilter.ParserTypes.JSON), 
                {context: BindingContext.VALUE}
            );
            //spy on controller
            spyOn(server.controller('DummyController'), 'post').and.callFake((req, res) => {
                parsedBody = req.body;
                res.status(200).end();
            });
            //get express app
            app = server.component<ExpressApp>(<any> App).getApp();
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