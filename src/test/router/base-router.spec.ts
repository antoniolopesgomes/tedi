import * as core from "../../core";
import { Injectable } from "../../decorators";
import { TediRoute, TediRouter, DefaultRouteActionsBuilder } from "../../router";

describe("BaseRouter", () => {

    @Injectable()
    class DummyController {
        get(): void { return; }
        post(): void { return; }
        put(): void { return; }
        delete(): void { return; }
    }

    @Injectable()
    class SimpleModule extends core.Module { }

    @Injectable()
    class SimpleFilter implements core.Filter<any> {
        apply(): void { return; }
        getDataFromRequest(): any { return; }
    }

    @Injectable()
    class SimpleErrorHandler implements core.ErrorHandler {
        catch(): void { return; }
    }

    let simpleModule: core.Module;
    let baseRouteActionsBuilder = new DefaultRouteActionsBuilder();

    beforeEach(() => {
        simpleModule = new SimpleModule();
    });

    describe("when we have valid routes", () => {
        let route: core.Route;
        let router: TediRouter;
        beforeEach(() => {
            // configure module
            simpleModule.dependencies(
                core.dependency("DummyController", { class: DummyController }),
                core.dependency("SimpleFilter", { class: SimpleFilter }),
                core.dependency("SimpleErrorHandler", { class: SimpleErrorHandler })
            );
            // define routes
            let jsonRoutes = {
                "$filters": ["SimpleFilter"],
                "/one": {
                    "$errorHandlers": ["SimpleErrorHandler"],
                    "get": ["DummyController", "get"],
                    "post": ["DummyController", "post"],
                    "put": ["DummyController", "put"],
                    "delete": ["DummyController", "delete"],
                    "/two": {},
                },
            };
            router = new TediRouter(null, baseRouteActionsBuilder);
            // build route
            route = router.getRootRoute(jsonRoutes, simpleModule);
        });
        describe("root route", () => {
            it("base route should have the right path", () => {
                expect(route.path).toEqual("/");
            });
            it("should have one filter", () => {
                expect(route.filters).toEqual(jasmine.any(Array));
                expect(route.filters.length).toEqual(1);
            });
            it("filter should be the right instance", () => {
                expect(route.filters[0].filter).toEqual(jasmine.any(SimpleFilter));
                expect(route.filters[0].token).toEqual("SimpleFilter");
            });
            it("should have no errorHandlers", () => {
                expect(route.errorHandlers).toEqual(jasmine.any(Array));
                expect(route.errorHandlers.length).toEqual(0);
            });
            it("should have no actions", () => {
                expect(route.actions.get).toBeUndefined();
                expect(route.actions.post).toBeUndefined();
                expect(route.actions.put).toBeUndefined();
                expect(route.actions.delete).toBeUndefined();
            });
            it("should have one child route", () => {
                expect(route.children).toEqual(jasmine.any(Array));
                expect(route.children.length).toEqual(1);
            });
        });

        describe("route: /one", () => {
            let childRoute: core.Route;
            beforeEach(() => {
                childRoute = route.children[0];
            });
            it("base route should have the right path", () => {
                expect(childRoute.path).toEqual("/one");
            });
            it("should be a BaseRoute", () => {
                expect(childRoute).toEqual(jasmine.any(TediRoute));
            });
            it("should have get action defined", () => {
                expect(childRoute.actions.get.controller).toEqual(jasmine.any(DummyController));
                expect(childRoute.actions.get.controllerMethod).toEqual("get");
            });
            it("should have post action defined", () => {
                expect(childRoute.actions.post.controller).toEqual(jasmine.any(DummyController));
                expect(childRoute.actions.post.controllerMethod).toEqual("post");
            });
            it("should have put action defined", () => {
                expect(childRoute.actions.put.controller).toEqual(jasmine.any(DummyController));
                expect(childRoute.actions.put.controllerMethod).toEqual("put");
            });
            it("should have delete action defined", () => {
                expect(childRoute.actions.delete.controller).toEqual(jasmine.any(DummyController));
                expect(childRoute.actions.delete.controllerMethod).toEqual("delete");
            });
            it("should have one errorHandler", () => {
                expect(childRoute.errorHandlers).toEqual(jasmine.any(Array));
                expect(childRoute.errorHandlers.length).toEqual(1);
            });
            it("errorHandler should be the right instance", () => {
                expect(childRoute.errorHandlers[0].errorHandler).toEqual(jasmine.any(SimpleErrorHandler));
                expect(childRoute.errorHandlers[0].token).toEqual("SimpleErrorHandler");
            });
        });

        describe("route /two", () => {
            let childRoute: core.Route;
            beforeEach(() => {
                childRoute = route.children[0].children[0];
            });
            it("should be defined", () => {
                expect(childRoute).toEqual(jasmine.any(TediRoute));
            });
            it("should have the right path", () => {
                expect(childRoute.path).toEqual("/one/two");
            });
        });
    });

    describe("with invalid filters", () => {
        let jsonRouter: any;
        let router: TediRouter;
        beforeEach(() => {
            // define router
            jsonRouter = {
                "/dummy": {
                    "$filters": ["InvalidFilter"],
                },
            };
            router = new TediRouter(null, baseRouteActionsBuilder);
        });

        describe("when filter does not implement BaseFilter", () => {
            @Injectable()
            class InvalidFilter { }
            beforeEach(() => {
                simpleModule.dependencies(core.dependency("InvalidFilter", { class: InvalidFilter }));
            });
            it("should throw a FilterError", (done: DoneFn) => {
                try {
                    router.getRootRoute(jsonRouter, simpleModule);
                } catch (error) {
                    expect(error).toEqual(jasmine.any(core.RouteError));
                    expect(error.search(core.FilterError)).toEqual(jasmine.any(core.FilterError));
                    expect(error.getRootCause()).toEqual("invalid Filter instance");
                    done();
                }
            });
        });
    });

    describe("with invalid errorHandlers", () => {
        let jsonRouter: any;
        let router: TediRouter;
        beforeEach(() => {
            jsonRouter = {
                "/dummy": {
                    "$errorHandlers": ["InvalidErrorHandler"],
                },
            };
            router = new TediRouter(null, baseRouteActionsBuilder);
        });
        describe("when errorHandler doest not implement BaseErrorHandler", () => {
            @Injectable()
            class InvalidErrorHandler { }

            beforeEach(() => {
                simpleModule.dependencies(
                    core.dependency("InvalidErrorHandler", { class: InvalidErrorHandler })
                );
            });

            it("should throw an ErrorHandlerError", (done: DoneFn) => {
                try {
                    router.getRootRoute(jsonRouter, simpleModule);
                } catch (error) {
                    expect(error).toEqual(jasmine.any(core.RouteError));
                    expect(error.search(core.ErrorHandlerError)).toEqual(jasmine.any(core.ErrorHandlerError));
                    expect(error.getRootCause()).toEqual("invalid ErrorHandler instance");
                    done();
                }
            });
        });
    });
});
