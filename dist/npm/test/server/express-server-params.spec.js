"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("../../core");
var server_1 = require("../../server");
var request = require("supertest-as-promised");
describe("ExpressServer params", function () {
    var server;
    beforeEach(function () {
        server = new server_1.ExpressServer();
    });
    describe("given a route tree with parameters", function () {
        var TestController = (function () {
            function TestController() {
            }
            TestController.prototype.get = function () { return; };
            TestController = __decorate([
                core_1.Controller(), 
                __metadata('design:paramtypes', [])
            ], TestController);
            return TestController;
        }());
        beforeEach(function () {
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
                .dependencies(core_1.dependency("TestController", { class: TestController }));
        });
        describe("when I call a route with params", function () {
            var params;
            beforeEach(function () {
                spyOn(server.getDependency("TestController"), "get")
                    .and.callFake(function (req, res) {
                    params = req.params;
                    res.status(200).end();
                });
            });
            describe("/api/user/1", function () {
                beforeEach(function (done) {
                    request(server.getApp())
                        .get("/api/user/1")
                        .expect(200)
                        .then(function () { return done(); })
                        .catch(function (error) { return done.fail(error); });
                });
                it("user_id parameter should be 1", function () {
                    expect(params.user_id).toEqual("1");
                });
            });
            describe("when i call /api/user/1/address/2", function () {
                beforeEach(function (done) {
                    request(server.getApp())
                        .get("/api/user/1/address/2")
                        .expect(200)
                        .then(function () { return done(); })
                        .catch(function (error) { return done.fail(error); });
                });
                it("user_id parameter should be 1", function () {
                    expect(params.user_id).toEqual("1");
                });
                it("address_id parameter should be 2", function () {
                    expect(params.address_id).toEqual("2");
                });
            });
        });
    });
});
