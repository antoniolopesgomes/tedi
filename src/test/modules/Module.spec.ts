
import * as express from "express";
import * as request from "supertest-as-promised";
import { Filter, Module, dependency, Logger, LOGGER } from "../../core";
import { Injectable } from "../../decorators";
import { ExpressServer } from "../../express";

describe("Modules", () => {

    let server: ExpressServer;

    @Injectable()
    class AuthController {
        get(req, res): void {
            res.status(200).end();
        };
    }

    @Injectable()
    class CustomFilter2 implements Filter<any> {
        apply(req: express.Request, res: express.Response): any { return; }
        getDataFromRequest(req: express.Request): any { return; }
    }

    @Injectable()
    class AuthModule extends Module {
        constructor() {
            super();
            this.setJsonRoutes({
                "/login": {
                    "$filters": ["RootFilter"],
                    "get": ["AuthController", "get"],
                },
            });
            this.dependencies(
                dependency("AuthController", { class: AuthController }),
                dependency("RootFilter", { class: CustomFilter2 })
            );
        }
    }

    beforeEach(() => {
        server = new ExpressServer();
    });

    describe("When we got an app with a child module", () => {
        let results: any[] = [];
        let app: express.Application;
        let authModule: Module;

        beforeEach(() => {
            results.push("_here");
            server
                .setJsonRoutes({
                    "/auth": "AuthModule",
                })
                .setModule("AuthModule", new AuthModule());
            app = server.getApp();
            authModule = server.getDependency<Module>("AuthModule");
        });

        describe("/auth/login", () => {
            beforeEach((done: DoneFn) => {
                results.push("here");
                spyOn(authModule.getDependency("AuthController"), "get").and.callThrough();
                spyOn(authModule.getDependency("RootFilter"), "apply").and.callThrough();
                request(app)
                    .get("/auth/login")
                    .expect(200)
                    .then(() => done())
                    .catch(done.fail);
            });

            it("should have called the module controller", () => {
                expect(authModule.getDependency<AuthController>("AuthController").get).toHaveBeenCalled();
            });

            it("should have called the module auth.RootFilter", () => {
                expect(authModule.getDependency<Filter<any>>("RootFilter").apply).toHaveBeenCalled();
            });
        });

        describe("and we try to access the child module", () => {
            it("should have a reference to the childModule", () => {
                expect(authModule).toEqual(jasmine.any(AuthModule));
            });
            it("childModule should have access to root module dependencies", () => {
                expect(authModule.getDependency<Logger>(LOGGER)).not.toBeNull();
            });

            describe("and override an internal component", () => {
                @Injectable()
                class CustomAuthController {
                    get(req, res): void {
                        res.status(200).end();
                    }
                }
                beforeEach(() => {
                    authModule.dependencies(
                        dependency("AuthController", { class: CustomAuthController })
                    );
                });
                it("should have overrided AuthController", () => {
                    expect(authModule.getDependency("AuthController")).toEqual(jasmine.any(CustomAuthController));
                });
            });
        });
    });
});
