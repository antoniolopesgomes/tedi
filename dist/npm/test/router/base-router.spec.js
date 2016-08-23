"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var router_1 = require("../../lib/router");
var core_1 = require("../../core");
var error_handler_1 = require("../../lib/error-handler");
var filter_1 = require("../../lib/filter");
describe("BaseRouter", function () {
    var DummyController = (function () {
        function DummyController() {
        }
        DummyController.prototype.get = function () { return; };
        DummyController.prototype.post = function () { return; };
        DummyController.prototype.put = function () { return; };
        DummyController.prototype.delete = function () { return; };
        DummyController = __decorate([
            core_1.Controller(), 
            __metadata('design:paramtypes', [])
        ], DummyController);
        return DummyController;
    }());
    var SimpleModule = (function (_super) {
        __extends(SimpleModule, _super);
        function SimpleModule() {
            _super.apply(this, arguments);
        }
        SimpleModule.prototype.init = function () { return; };
        SimpleModule = __decorate([
            core_1.Module(), 
            __metadata('design:paramtypes', [])
        ], SimpleModule);
        return SimpleModule;
    }(core_1.BaseModule));
    var SimpleFilter = (function () {
        function SimpleFilter() {
        }
        SimpleFilter.prototype.apply = function () { return; };
        SimpleFilter.prototype.getDataFromRequest = function () { return; };
        SimpleFilter = __decorate([
            core_1.Filter(), 
            __metadata('design:paramtypes', [])
        ], SimpleFilter);
        return SimpleFilter;
    }());
    var SimpleErrorHandler = (function () {
        function SimpleErrorHandler() {
        }
        SimpleErrorHandler.prototype.catch = function () { return; };
        SimpleErrorHandler = __decorate([
            core_1.ErrorHandler(), 
            __metadata('design:paramtypes', [])
        ], SimpleErrorHandler);
        return SimpleErrorHandler;
    }());
    var simpleModule;
    beforeEach(function () {
        simpleModule = new SimpleModule();
    });
    describe("when we have valid routes", function () {
        var route;
        var router;
        beforeEach(function () {
            // configure module
            simpleModule.dependencies(core_1.dependency("DummyController", { class: DummyController }), core_1.dependency("SimpleFilter", { class: SimpleFilter }), core_1.dependency("SimpleErrorHandler", { class: SimpleErrorHandler }));
            // define routes
            var jsonRoutes = {
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
            router = new router_1.BaseRouter(null);
            // build route
            route = router.getRootRoute(jsonRoutes, simpleModule);
        });
        describe("root route", function () {
            it("base route should have the right path", function () {
                expect(route.path).toEqual("/");
            });
            it("should have one filter", function () {
                expect(route.filters).toEqual(jasmine.any(Array));
                expect(route.filters.length).toEqual(1);
            });
            it("filter should be the right instance", function () {
                expect(route.filters[0].filter).toEqual(jasmine.any(SimpleFilter));
                expect(route.filters[0].name).toEqual("SimpleFilter");
            });
            it("should have no errorHandlers", function () {
                expect(route.errorHandlers).toEqual(jasmine.any(Array));
                expect(route.errorHandlers.length).toEqual(0);
            });
            it("should have no actions", function () {
                expect(route.get).toBeUndefined();
                expect(route.post).toBeUndefined();
                expect(route.put).toBeUndefined();
                expect(route.delete).toBeUndefined();
            });
            it("should have one child route", function () {
                expect(route.children).toEqual(jasmine.any(Array));
                expect(route.children.length).toEqual(1);
            });
        });
        describe("route: /one", function () {
            var childRoute;
            beforeEach(function () {
                childRoute = route.children[0];
            });
            it("base route should have the right path", function () {
                expect(childRoute.path).toEqual("/one");
            });
            it("should be a BaseRoute", function () {
                expect(childRoute).toEqual(jasmine.any(router_1.BaseRoute));
            });
            it("should have get action defined", function () {
                expect(childRoute.get.controller).toEqual(jasmine.any(DummyController));
                expect(childRoute.get.controllerMethod).toEqual("get");
            });
            it("should have post action defined", function () {
                expect(childRoute.post.controller).toEqual(jasmine.any(DummyController));
                expect(childRoute.post.controllerMethod).toEqual("post");
            });
            it("should have put action defined", function () {
                expect(childRoute.put.controller).toEqual(jasmine.any(DummyController));
                expect(childRoute.put.controllerMethod).toEqual("put");
            });
            it("should have delete action defined", function () {
                expect(childRoute.delete.controller).toEqual(jasmine.any(DummyController));
                expect(childRoute.delete.controllerMethod).toEqual("delete");
            });
            it("should have one errorHandler", function () {
                expect(childRoute.errorHandlers).toEqual(jasmine.any(Array));
                expect(childRoute.errorHandlers.length).toEqual(1);
            });
            it("errorHandler should be the right instance", function () {
                expect(childRoute.errorHandlers[0].errorHandler).toEqual(jasmine.any(SimpleErrorHandler));
                expect(childRoute.errorHandlers[0].name).toEqual("SimpleErrorHandler");
            });
        });
        describe("route /two", function () {
            var childRoute;
            beforeEach(function () {
                childRoute = route.children[0].children[0];
            });
            it("should be defined", function () {
                expect(childRoute).toEqual(jasmine.any(router_1.BaseRoute));
            });
            it("should have the right path", function () {
                expect(childRoute.path).toEqual("/one/two");
            });
        });
    });
    describe("with invalid filters", function () {
        var jsonRouter;
        var router;
        beforeEach(function () {
            // define router
            jsonRouter = {
                "/dummy": {
                    "$filters": ["InvalidFilter"],
                },
            };
            router = new router_1.BaseRouter(null);
        });
        describe("when filter does not implement BaseFilter", function () {
            var InvalidFilter = (function () {
                function InvalidFilter() {
                }
                InvalidFilter = __decorate([
                    core_1.Filter(), 
                    __metadata('design:paramtypes', [])
                ], InvalidFilter);
                return InvalidFilter;
            }());
            beforeEach(function () {
                simpleModule.dependencies(core_1.dependency("InvalidFilter", { class: InvalidFilter }));
            });
            it("should throw a FilterError", function (done) {
                try {
                    router.getRootRoute(jsonRouter, simpleModule);
                }
                catch (error) {
                    expect(error).toEqual(jasmine.any(router_1.RouteError));
                    expect(error.getRootCause()).toEqual(jasmine.any(filter_1.FilterValidatorError));
                    done();
                }
            });
        });
        describe("when filter is wrongly decorated", function () {
            var NotDecoratedFilter = (function () {
                function NotDecoratedFilter() {
                }
                NotDecoratedFilter.prototype.apply = function () { return; };
                NotDecoratedFilter.prototype.getDataFromRequest = function () { return; };
                NotDecoratedFilter = __decorate([
                    core_1.Service(), 
                    __metadata('design:paramtypes', [])
                ], NotDecoratedFilter);
                return NotDecoratedFilter;
            }());
            beforeEach(function () {
                simpleModule.dependencies(core_1.dependency("InvalidFilter", { class: NotDecoratedFilter }));
            });
            it("should throw a FilterError", function (done) {
                try {
                    router.getRootRoute(jsonRouter, simpleModule);
                }
                catch (error) {
                    expect(error).toEqual(jasmine.any(router_1.RouteError));
                    expect(error.getRootCause()).toEqual(jasmine.any(filter_1.FilterValidatorError));
                    done();
                }
            });
        });
    });
    describe("with invalid errorHandlers", function () {
        var jsonRouter;
        var router;
        beforeEach(function () {
            jsonRouter = {
                "/dummy": {
                    "$errorHandlers": ["InvalidErrorHandler"],
                },
            };
            router = new router_1.BaseRouter(null);
        });
        describe("when error handler doest not implement BaseErrorHandler interface", function () {
            var InvalidErrorHandler = (function () {
                function InvalidErrorHandler() {
                }
                InvalidErrorHandler = __decorate([
                    core_1.ErrorHandler(), 
                    __metadata('design:paramtypes', [])
                ], InvalidErrorHandler);
                return InvalidErrorHandler;
            }());
            beforeEach(function () {
                simpleModule.dependencies(core_1.dependency("InvalidErrorHandler", { class: InvalidErrorHandler }));
            });
            it("should throw an ErrorHandlerError", function (done) {
                try {
                    router.getRootRoute(jsonRouter, simpleModule);
                }
                catch (error) {
                    expect(error).toEqual(jasmine.any(router_1.RouteError));
                    expect(error.getRootCause()).toEqual(jasmine.any(error_handler_1.ErrorHandlerValidatorError));
                    done();
                }
            });
        });
        describe("when errorHandler is wrongly decorated", function () {
            var NotDecoratedErrorHandler = (function () {
                function NotDecoratedErrorHandler() {
                }
                NotDecoratedErrorHandler.prototype.catch = function () { return; };
                NotDecoratedErrorHandler = __decorate([
                    core_1.Service(), 
                    __metadata('design:paramtypes', [])
                ], NotDecoratedErrorHandler);
                return NotDecoratedErrorHandler;
            }());
            beforeEach(function () {
                simpleModule.dependencies(core_1.dependency("InvalidErrorHandler", { class: NotDecoratedErrorHandler }));
            });
            it("should throw an ErrorHandlerError", function (done) {
                try {
                    router.getRootRoute(jsonRouter, simpleModule);
                }
                catch (error) {
                    expect(error).toEqual(jasmine.any(router_1.RouteError));
                    expect(error.getRootCause()).toEqual(jasmine.any(error_handler_1.ErrorHandlerValidatorError));
                    done();
                }
            });
        });
    });
});
