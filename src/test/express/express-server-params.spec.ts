import * as request from "supertest-as-promised";
import * as express from "express";
import {Controller, dependency} from "../../core";
import {ExpressServer} from "../../express";

describe("ExpressServer params", () => {

    let server: ExpressServer;

    beforeEach(() => {
        server = new ExpressServer();
    });

    describe("given a route tree with parameters", () => {
        @Controller()
        class TestController {
            get(): void { return; }
        }

        beforeEach(() => {
            server
                .setJsonRoutes({
                    "/api": {
                        "/user/:user_id": {
                            "get": ["TestController", "get"],
                            "/address/:address_id": {
                                "get": ["TestController", "get"],
                            },
                        },
                    },
                })
                .dependencies(
                    dependency("TestController", { class: TestController })
                );
        });

        describe("when I call a route with params", () => {
            let params: any;
            beforeEach(() => {
                spyOn(server.getDependency<TestController>("TestController"), "get")
                    .and.callFake((req: express.Request, res: express.Response) => {
                        params = req.params;
                        res.status(200).end();
                    });
            });
            describe("/api/user/1", () => {
                beforeEach((done: DoneFn) => {
                    request(server.getApp())
                        .get("/api/user/1")
                        .expect(200)
                        .then(() => done())
                        .catch((error: any) => done.fail(error));
                });
                it("user_id parameter should be 1", () => {
                    expect(params.user_id).toEqual("1");
                });
            });

            describe("when i call /api/user/1/address/2", () => {
                beforeEach((done: DoneFn) => {
                    request(server.getApp())
                        .get("/api/user/1/address/2")
                        .expect(200)
                        .then(() => done())
                        .catch((error: any) => done.fail(error));
                });
                it("user_id parameter should be 1", () => {
                    expect(params.user_id).toEqual("1");
                });
                it("address_id parameter should be 2", () => {
                    expect(params.address_id).toEqual("2");
                });
            });
        });
    });
});
