
import * as express from "express";
import * as request from "supertest-as-promised";
import {ExpressServer} from "../../express";
import {
    BaseFilter,
    BaseModule,
    tedi,
    dependency,
    Logger,
} from "../../core";

describe("Modules", () => {

    let server: ExpressServer;

    @tedi.controller()
    class AuthController {
        get(req, res): void {
            res.status(200).end();
        };
    }

    @tedi.filter()
    class CustomFilter2 implements BaseFilter<any> {
        apply(req: express.Request, res: express.Response): any { return; }
        getDataFromRequest(req: express.Request): any { return; }
    }

    @tedi.module()
    class AuthModule extends BaseModule {
        init(): void {
            this
                .setJsonRoutes({
                    "/login": {
                        "$filters": ["RootFilter"],
                        "get": ["AuthController", "get"],
                    },
                })
                .dependencies(
                    dependency("AuthController", { class: AuthController}),
                    dependency("RootFilter", { class: CustomFilter2})
                );
        }
    }

    beforeEach(() => {
        server = new ExpressServer();
    });

    describe("When we got an app with a child module", () => {
        let results: any[] = [];
        let app: express.Application;
        let authModule: BaseModule;

        beforeEach(() => {
            results.push("_here");
            server
                .setJsonRoutes({
                    "/auth": "AuthModule",
                })
                .setModule("AuthModule", AuthModule);
            // server.component<Logger>("Logger").setLevel(LoggerLevels.DEBUG);
            app = server.getApp();
            authModule = server.getDependency<BaseModule>("AuthModule");
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
                expect(authModule.getDependency<BaseFilter<any>>("RootFilter").apply).toHaveBeenCalled();
            });
        });

        describe("and we try to access the child module", () => {
            it("should have a reference to the childModule", () => {
                expect(authModule).toEqual(jasmine.any(AuthModule));
            });
            it("childModule should have access to root module dependencies", () => {
                expect(authModule.getDependency<Logger>("Logger")).not.toBeNull();
            });

            describe("and override an internal component", () => {
                @tedi.controller()
                class CustomAuthController {
                    get(req, res): void {
                        res.status(200).end();
                    }
                }
                beforeEach(() => {
                    authModule.dependencies(
                        dependency("AuthController", { class: CustomAuthController})
                    );
                });
                it("should have overrided AuthController", () => {
                    expect(authModule.getDependency("AuthController")).toEqual(jasmine.any(CustomAuthController));
                });
            });
        });
    });
});
