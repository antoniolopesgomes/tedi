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
var server_1 = require("../../server");
var core_1 = require("../../core");
var request = require("supertest-as-promised");
describe("Modules", function () {
    var server;
    var AuthController = (function () {
        function AuthController() {
        }
        AuthController.prototype.get = function (req, res) {
            res.status(200).end();
        };
        ;
        AuthController = __decorate([
            core_1.Controller(), 
            __metadata('design:paramtypes', [])
        ], AuthController);
        return AuthController;
    }());
    var CustomFilter2 = (function () {
        function CustomFilter2() {
        }
        CustomFilter2.prototype.apply = function (req, res) { return; };
        CustomFilter2.prototype.getDataFromRequest = function (req) { return; };
        CustomFilter2 = __decorate([
            core_1.Filter(), 
            __metadata('design:paramtypes', [])
        ], CustomFilter2);
        return CustomFilter2;
    }());
    var AuthModule = (function (_super) {
        __extends(AuthModule, _super);
        function AuthModule() {
            _super.apply(this, arguments);
        }
        AuthModule.prototype.init = function () {
            this
                .setJsonRoutes({
                "/login": {
                    "$filters": ["RootFilter"],
                    "get": ["AuthController", "get"],
                },
            })
                .dependencies(core_1.dependency("AuthController", { class: AuthController }), core_1.dependency("RootFilter", { class: CustomFilter2 }));
        };
        AuthModule = __decorate([
            core_1.Module(), 
            __metadata('design:paramtypes', [])
        ], AuthModule);
        return AuthModule;
    }(core_1.BaseModule));
    beforeEach(function () {
        server = new server_1.ExpressServer();
    });
    describe("When we got an app with a child module", function () {
        var results = [];
        var app;
        var authModule;
        beforeEach(function () {
            results.push("_here");
            server
                .setJsonRoutes({
                "/auth": "AuthModule",
            })
                .setModule("AuthModule", AuthModule);
            // server.component<Logger>("Logger").setLevel(LoggerLevels.DEBUG);
            app = server.getApp();
            authModule = server.getDependency("AuthModule");
        });
        describe("/auth/login", function () {
            beforeEach(function (done) {
                results.push("here");
                spyOn(authModule.getDependency("AuthController"), "get").and.callThrough();
                spyOn(authModule.getDependency("RootFilter"), "apply").and.callThrough();
                request(app)
                    .get("/auth/login")
                    .expect(200)
                    .then(function () { return done(); })
                    .catch(done.fail);
            });
            it("should have called the module controller", function () {
                expect(authModule.getDependency("AuthController").get).toHaveBeenCalled();
            });
            it("should have called the module auth.RootFilter", function () {
                expect(authModule.getDependency("RootFilter").apply).toHaveBeenCalled();
            });
        });
        describe("and we try to access the child module", function () {
            it("should have a reference to the childModule", function () {
                expect(authModule).toEqual(jasmine.any(AuthModule));
            });
            it("childModule should have access to root module dependencies", function () {
                expect(authModule.getDependency("Logger")).not.toBeNull();
            });
            describe("and override an internal component", function () {
                var CustomAuthController = (function () {
                    function CustomAuthController() {
                    }
                    CustomAuthController.prototype.get = function (req, res) {
                        res.status(200).end();
                    };
                    CustomAuthController = __decorate([
                        core_1.Controller(), 
                        __metadata('design:paramtypes', [])
                    ], CustomAuthController);
                    return CustomAuthController;
                }());
                beforeEach(function () {
                    authModule.dependencies(core_1.dependency("AuthController", { class: CustomAuthController }));
                });
                it("should have overrided AuthController", function () {
                    expect(authModule.getDependency("AuthController")).toEqual(jasmine.any(CustomAuthController));
                });
            });
        });
    });
});
