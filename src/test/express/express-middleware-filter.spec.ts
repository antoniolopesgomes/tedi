import * as request from "supertest-as-promised";
import * as express from "express";

import * as bodyParser from "body-parser";
import { ExpressServer, ExpressMiddlewareFilter } from "../../express";
import * as core from "../../core";
import { Injectable } from "../../decorators";

describe("ExpressMiddlewareFilter", () => {

    let jsonBodyParser = bodyParser.json();
    let server: ExpressServer;
    let payloadString = "this is a dummy payload";

    @Injectable()
    class DummyController {
        post(): void { return; }
    }

    beforeEach(() => {
        server = new ExpressServer();
        server
            .setJsonRoutes({
                "/api": {
                    "$filters": ["jsonBodyParser"],
                    "post": [DummyController, "post"],
                },
            })
            .dependencies(
                DummyController,
                core.dependency("jsonBodyParser", { value: new ExpressMiddlewareFilter(jsonBodyParser) })
            );
    });

    describe("When we GET a node with a filter", () => {
        let req: express.Request;
        beforeEach((done: DoneFn) => {
            spyOn(server.getDependency("jsonBodyParser"), "apply").and.callThrough();
            spyOn(server.getDependency(DummyController), "post").and.callFake((_req: express.Request, res: express.Response) => {
                req = _req;
                res.status(200).end();
            });
            request(server.getApp())
                .post("/api")
                .send({
                    payload: payloadString,
                })
                .expect(200)
                .then((res: request.Response) => done())
                .catch((error: any) => done.fail(error));
        });
        it("should have called filter#apply", () => {
            expect(server.getDependency<core.Filter<any>>("jsonBodyParser").apply).toHaveBeenCalled();
        });
        it("should have called controller", () => {
            expect(server.getDependency(DummyController).post).toHaveBeenCalled();
        });
        it("should have body payload in the request", () => {
            expect(req.body.payload).toEqual(payloadString);
        });

    });

});
