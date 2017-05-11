
import * as request from "supertest-as-promised";
import * as express from "express";
import * as core from "../../core";
import { Injectable, web } from "../../decorators";
import {ExpressServer} from "../../express";

describe("ExpressServer", () => {

    let server: ExpressServer;

    @Injectable()
    class AuthController {
        login(req, res: express.Response) {
            res.send(req.$thisFilter);
        }
        saveUser(req, res: express.Response) {
            res.send(req.$thisFilter);
        }
        saveAdmin(req, res: express.Response) {
            res.send(req.$thisFilter);
        }
    }

    @Injectable()
    class CustomFilter implements core.Filter<any> {
        apply(req: express.Request, res: express.Response): any { return; }
        getDataFromRequest(req: express.Request): any { return; }
    }

    @Injectable()
    class CustomErrorHandler implements core.ErrorHandler {
        catch(err: any) {
            throw err;
        }
    }

    @Injectable()
    class ControllerClass {
        @web.get()
        read(req: express.Request, res: express.Response): void {
            res.status(200).end();
        }
        @web.post()
        write(req: express.Request, res: express.Response): void {
            res.status(200).end();
        }
    }

    beforeEach(() => {
        server = new ExpressServer();
    });

    describe("when we have a valid app", () => {

        let expressApp: express.Application;

        beforeEach(() => {
            server
                .setJsonRoutes({
                    "$errorHandlers": ["RootErrorHandler"],
                    "$filters": ["RootFilter"],
                    "/auth": {
                        "$errorHandlers": ["AuthErrorHandler"],
                        "/login": {
                            "$filters": ["LoginFilter", "AfterLoginFilter"],
                            "$errorHandlers": ["LoginErrorHandler", "AfterLoginErrorHandler"],
                            "get": [AuthController, "login"],
                            "/user": {
                                "$filters": ["UserFilter"],
                                "post": [AuthController, "saveUser"],
                            },
                            "/admin": {
                                "$filters": ["AdminFilter"],
                                "post": [AuthController, "saveAdmin"],
                            },
                        },
                    },
                    "/controllers": {
                        "$controller": ControllerClass,
                        "post": [AuthController, "saveUser"],
                    },
                })
                .dependencies(
                    AuthController,
                    ControllerClass,
                    core.dependency("RootFilter", { class: CustomFilter }),
                    core.dependency("LoginFilter", { class: CustomFilter }),
                    core.dependency("AfterLoginFilter", { class: CustomFilter }),
                    core.dependency("UserFilter", { class: CustomFilter }),
                    core.dependency("AdminFilter", { class: CustomFilter }),
                    core.dependency("RootErrorHandler", { class: CustomErrorHandler }),
                    core.dependency("LoginErrorHandler", { class: CustomErrorHandler }),
                    core.dependency("AfterLoginErrorHandler", { class: CustomErrorHandler }),
                    core.dependency("AuthErrorHandler", { class: CustomErrorHandler })
                );

            expressApp = server.getApp();
            server.getLogger().setLevel(core.LoggerLevels.EMERGENCY);
        });

        describe("GET /auth/login", () => {

            beforeEach((done: DoneFn) => {
                spyOn(server.getDependency(AuthController), "saveUser").and.callThrough();
                spyOn(server.getDependency(AuthController), "login").and.callThrough();
                spyOn(server.getDependency<any>("UserFilter"), "apply").and.callThrough();
                spyOn(server.getDependency<any>("RootFilter"), "apply").and.callThrough();
                spyOn(server.getDependency<any>("LoginFilter"), "apply").and.callThrough();
                spyOn(server.getDependency<any>("AfterLoginFilter"), "apply").and.callThrough();
                spyOn(server.getDependency<any>("AdminFilter"), "apply").and.callThrough();

                server.getLogger().setLevel(core.LoggerLevels.DEBUG);

                return request(expressApp).get("/auth/login")
                    .expect(200)
                    .then(() => done())
                    .catch((error) => done.fail(error));
            });

            it("should have called the right controllers", () => {
                expect(server.getDependency<AuthController>(AuthController).login).toHaveBeenCalled();
                expect(server.getDependency<AuthController>(AuthController).saveUser).not.toHaveBeenCalled();
            });

            it("should have called the right filters", () => {
                expect(server.getDependency<core.Filter<any>>("RootFilter").apply).toHaveBeenCalled();
                expect(server.getDependency<core.Filter<any>>("LoginFilter").apply).toHaveBeenCalled();
                expect(server.getDependency<core.Filter<any>>("AfterLoginFilter").apply).toHaveBeenCalled();
                expect(server.getDependency<core.Filter<any>>("UserFilter").apply).not.toHaveBeenCalled();
                expect(server.getDependency<core.Filter<any>>("AdminFilter").apply).not.toHaveBeenCalled();
            });

        });

        describe("POST /auth/login/user", () => {

            beforeEach((done: DoneFn) => {
                spyOn(server.getDependency(AuthController), "saveUser").and.callThrough();
                spyOn(server.getDependency(AuthController), "login").and.callThrough();
                spyOn(server.getDependency<any>("RootFilter"), "apply").and.callThrough();
                spyOn(server.getDependency<any>("UserFilter"), "apply").and.callThrough();
                spyOn(server.getDependency<any>("LoginFilter"), "apply").and.callThrough();
                spyOn(server.getDependency<any>("AdminFilter"), "apply").and.callThrough();

                return request(expressApp).post("/auth/login/user")
                    .expect(200)
                    .then(() => done())
                    .catch((error) => done.fail(error));
            });

            it("should have called the right controllers", () => {
                expect(server.getDependency<AuthController>(AuthController).saveUser).toHaveBeenCalled();
                expect(server.getDependency<AuthController>(AuthController).login).not.toHaveBeenCalled();
            });

            it("should have called the right filters", () => {
                expect(server.getDependency<core.Filter<any>>("RootFilter").apply).toHaveBeenCalled();
                expect(server.getDependency<core.Filter<any>>("LoginFilter").apply).toHaveBeenCalled();
                expect(server.getDependency<core.Filter<any>>("UserFilter").apply).toHaveBeenCalled();
                expect(server.getDependency<core.Filter<any>>("AdminFilter").apply).not.toHaveBeenCalled();
            });

        });

        describe("/controllers", () => {
            describe("GET", () => {
                beforeEach((done: DoneFn) => {
                    spyOn(server.getDependency<ControllerClass>(ControllerClass), "read").and.callThrough();
                    request(expressApp)
                        .get("/controllers")
                        .expect(200)
                        .then(() => done())
                        .catch((error) => done.fail(error));
                });
                it("should have called read", () => {
                    expect(server.getDependency<ControllerClass>(ControllerClass).read).toHaveBeenCalled();
                });
            });
            describe("POST override", () => {
                beforeEach((done: DoneFn) => {
                    spyOn(server.getDependency<ControllerClass>(ControllerClass), "write").and.callThrough();
                    spyOn(server.getDependency<AuthController>(AuthController), "saveUser").and.callThrough();
                    request(expressApp)
                        .post("/controllers")
                        .expect(200)
                        .then(() => done())
                        .catch((error) => done.fail(error));
                });
                it("should not have called ControlClass method", () => {
                    expect(server.getDependency<ControllerClass>(ControllerClass).write).not.toHaveBeenCalled();
                });
                it("should not have called AuthController method", () => {
                    expect(server.getDependency<AuthController>(AuthController).saveUser).toHaveBeenCalled();
                });
            });
        });

        describe("with nested filters", () => {
            let filterQueue: string[];
            beforeEach((done: DoneFn) => {
                filterQueue = [];
                spyOn(server.getDependency<any>("RootFilter"), "apply").and.callFake(() => {
                    filterQueue.push("RootFilter");
                });
                spyOn(server.getDependency<any>("LoginFilter"), "apply").and.callFake(() => {
                    filterQueue.push("LoginFilter");
                });
                spyOn(server.getDependency<any>("AfterLoginFilter"), "apply").and.callFake(() => {
                    filterQueue.push("AfterLoginFilter");
                });

                return request(expressApp).get("/auth/login")
                    .expect(200)
                    .then(() => done())
                    .catch((error) => done.fail(error));
            });
            it("filters should be called in the right order", () => {
                expect(filterQueue).toEqual(["RootFilter", "LoginFilter", "AfterLoginFilter"]);
            });
        });

        describe("and a controller throws an error", () => {
            beforeEach(() => {
                spyOn(server.getDependency(AuthController), "login").and.throwError("Error on controller.");
            });
            describe("and loginErrorHandler handles it", () => {
                let catchedError: any;
                beforeEach((done: DoneFn) => {
                    spyOn(server.getDependency<any>("LoginErrorHandler"), "catch").and.callFake((error, req, res) => {
                        catchedError = error;
                        res.status(500).send("Error");
                    });
                    spyOn(server.getDependency<any>("AuthErrorHandler"), "catch");
                    return request(expressApp).get("/auth/login")
                        .expect(500)
                        .then(() => done())
                        .catch((error) => done.fail(error));
                });
                it("loginErrorHandler #catch should have been called", () => {
                    expect(server.getDependency<core.ErrorHandler>("LoginErrorHandler").catch).toHaveBeenCalled();
                });
                it("catchedError should be an ActionError", () => {
                    expect(catchedError).toEqual(jasmine.any(core.ActionError));
                });
                it("authErrorHandler #catch should not have been called", () => {
                    expect(server.getDependency<core.ErrorHandler>("AuthErrorHandler").catch).not.toHaveBeenCalled();
                });
            });
            describe("and only RootErrorHandler handles it", () => {
                let errorHandlers: string[];
                beforeEach((done: DoneFn) => {
                    errorHandlers = [];
                    spyOn(server.getDependency<any>("AfterLoginErrorHandler"), "catch").and.callFake((error, req, res) => {
                        errorHandlers.push("AfterLoginErrorHandler");
                        throw error;
                    });
                    spyOn(server.getDependency<any>("LoginErrorHandler"), "catch").and.callFake((error, req, res) => {
                        errorHandlers.push("LoginErrorHandler");
                        throw error;
                    });
                    spyOn(server.getDependency<any>("AuthErrorHandler"), "catch").and.callFake((error, req, res) => {
                        errorHandlers.push("AuthErrorHandler");
                        throw error;
                    });
                    spyOn(server.getDependency<any>("RootErrorHandler"), "catch").and.callFake((error, req, res) => {
                        errorHandlers.push("RootErrorHandler");
                        res.status(500).end();
                    });

                    return request(expressApp).get("/auth/login")
                        .expect(500)
                        .then(() => done())
                        .catch((error) => done.fail(error));
                });
                it("all error handlers should be called", () => {
                    expect(server.getDependency<core.ErrorHandler>("AfterLoginErrorHandler").catch).toHaveBeenCalled();
                    expect(server.getDependency<core.ErrorHandler>("LoginErrorHandler").catch).toHaveBeenCalled();
                    expect(server.getDependency<core.ErrorHandler>("AuthErrorHandler").catch).toHaveBeenCalled();
                    expect(server.getDependency<core.ErrorHandler>("RootErrorHandler").catch).toHaveBeenCalled();
                });
                it("error handlers should have been called in the right order", () => {
                    expect(errorHandlers).toEqual([
                        "LoginErrorHandler",
                        "AfterLoginErrorHandler",
                        "AuthErrorHandler",
                        "RootErrorHandler",
                    ]);
                });
            });
        });

        describe("and LoginFilter throws an error", () => {
            let catchedError: any;
            beforeEach((done: DoneFn) => {
                spyOn(server.getDependency<any>("LoginFilter"), "apply").and.callFake(() => {
                    throw new Error("Filter error");
                });
                spyOn(server.getDependency<any>("RootErrorHandler"), "catch").and.callFake((err: any, req, res: express.Response) => {
                    catchedError = err;
                    res.status(500).end();
                });
                return request(expressApp).get("/auth/login")
                    .expect(500)
                    .then(() => done())
                    .catch((error) => done.fail(error));
            });
            it("catchedError should be a FilterError", () => {
                expect(catchedError).toEqual(jasmine.any(core.FilterError));
            });
        });

        describe("and a login filter responds", () => {
            let response: request.Response;
            beforeEach((done) => {
                spyOn(server.getLogger(), "warn").and.callThrough();
                spyOn(server.getDependency(AuthController), "login");
                spyOn(server.getDependency<any>("LoginFilter"), "apply").and.callFake((req, res) => {
                    res.status(200).send("HIJACKED");
                });
                request(expressApp)
                    .get("/auth/login")
                    .expect(200)
                    .then((res: request.Response) => {
                        response = res;
                        done();
                    })
                    .catch(done.fail);

            });
            it("filter should have responded", () => {
                expect(server.getDependency<core.Filter<any>>("LoginFilter").apply).toHaveBeenCalled();
                expect(response.text).toEqual("HIJACKED");
            });
            it("server logger should warn about it", () => {
                expect(server.getLogger().warn).toHaveBeenCalled();
            });
        });
    });

});
