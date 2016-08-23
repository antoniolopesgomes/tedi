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
var request = require("supertest-as-promised");
var express = require("express");
var core_1 = require("../../core");
var logger_1 = require("../../logger");
var server_1 = require("../../server");
describe("ExpressServer", function () {
    var server;
    var AuthController = (function () {
        function AuthController() {
        }
        AuthController.prototype.login = function (req, res) {
            res.send(req.$thisFilter);
        };
        AuthController.prototype.saveUser = function (req, res) {
            res.send(req.$thisFilter);
        };
        AuthController.prototype.saveAdmin = function (req, res) {
            res.send(req.$thisFilter);
        };
        AuthController = __decorate([
            core_1.Controller(), 
            __metadata('design:paramtypes', [])
        ], AuthController);
        return AuthController;
    }());
    var CustomFilter = (function () {
        function CustomFilter() {
        }
        CustomFilter.prototype.apply = function (req, res) { return; };
        CustomFilter.prototype.getDataFromRequest = function (req) { return; };
        CustomFilter = __decorate([
            core_1.Filter(), 
            __metadata('design:paramtypes', [])
        ], CustomFilter);
        return CustomFilter;
    }());
    var CustomErrorHandler = (function () {
        function CustomErrorHandler() {
        }
        CustomErrorHandler.prototype.catch = function (err) {
            throw err;
        };
        CustomErrorHandler = __decorate([
            core_1.ErrorHandler(), 
            __metadata('design:paramtypes', [])
        ], CustomErrorHandler);
        return CustomErrorHandler;
    }());
    var ControllerClass = (function () {
        function ControllerClass() {
        }
        ControllerClass.prototype.read = function (req, res) {
            res.status(200).end();
        };
        ControllerClass.prototype.write = function (req, res) {
            res.status(200).end();
        };
        __decorate([
            core_1.Controller.get(), 
            __metadata('design:type', Function), 
            __metadata('design:paramtypes', [Object, Object]), 
            __metadata('design:returntype', void 0)
        ], ControllerClass.prototype, "read", null);
        __decorate([
            core_1.Controller.post(), 
            __metadata('design:type', Function), 
            __metadata('design:paramtypes', [Object, Object]), 
            __metadata('design:returntype', void 0)
        ], ControllerClass.prototype, "write", null);
        ControllerClass = __decorate([
            core_1.Controller(), 
            __metadata('design:paramtypes', [])
        ], ControllerClass);
        return ControllerClass;
    }());
    beforeEach(function () {
        server = new server_1.ExpressServer();
    });
    describe("when we have a valid app", function () {
        var expressApp;
        beforeEach(function () {
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
                .dependencies(AuthController, ControllerClass, core_1.dependency("RootFilter", { class: CustomFilter }), core_1.dependency("LoginFilter", { class: CustomFilter }), core_1.dependency("AfterLoginFilter", { class: CustomFilter }), core_1.dependency("UserFilter", { class: CustomFilter }), core_1.dependency("AdminFilter", { class: CustomFilter }), core_1.dependency("RootErrorHandler", { class: CustomErrorHandler }), core_1.dependency("LoginErrorHandler", { class: CustomErrorHandler }), core_1.dependency("AfterLoginErrorHandler", { class: CustomErrorHandler }), core_1.dependency("AuthErrorHandler", { class: CustomErrorHandler }));
            expressApp = server.getApp();
            server.getDependency("Logger").setLevel(logger_1.LoggerLevels.EMERGENCY);
        });
        describe("GET /auth/login", function () {
            beforeEach(function (done) {
                spyOn(server.getDependency(AuthController), "saveUser").and.callThrough();
                spyOn(server.getDependency(AuthController), "login").and.callThrough();
                spyOn(server.getDependency("UserFilter"), "apply").and.callThrough();
                spyOn(server.getDependency("RootFilter"), "apply").and.callThrough();
                spyOn(server.getDependency("LoginFilter"), "apply").and.callThrough();
                spyOn(server.getDependency("AfterLoginFilter"), "apply").and.callThrough();
                spyOn(server.getDependency("AdminFilter"), "apply").and.callThrough();
                server.getDependency("Logger").setLevel(logger_1.LoggerLevels.DEBUG);
                return request(expressApp).get("/auth/login")
                    .expect(200)
                    .then(function () { return done(); })
                    .catch(function (error) { return done.fail(error); });
            });
            it("should have called the right controllers", function () {
                expect(server.getDependency(AuthController).login).toHaveBeenCalled();
                expect(server.getDependency(AuthController).saveUser).not.toHaveBeenCalled();
            });
            it("should have called the right filters", function () {
                expect(server.getDependency("RootFilter").apply).toHaveBeenCalled();
                expect(server.getDependency("LoginFilter").apply).toHaveBeenCalled();
                expect(server.getDependency("AfterLoginFilter").apply).toHaveBeenCalled();
                expect(server.getDependency("UserFilter").apply).not.toHaveBeenCalled();
                expect(server.getDependency("AdminFilter").apply).not.toHaveBeenCalled();
            });
        });
        describe("POST /auth/login/user", function () {
            beforeEach(function (done) {
                spyOn(server.getDependency(AuthController), "saveUser").and.callThrough();
                spyOn(server.getDependency(AuthController), "login").and.callThrough();
                spyOn(server.getDependency("RootFilter"), "apply").and.callThrough();
                spyOn(server.getDependency("UserFilter"), "apply").and.callThrough();
                spyOn(server.getDependency("LoginFilter"), "apply").and.callThrough();
                spyOn(server.getDependency("AdminFilter"), "apply").and.callThrough();
                return request(expressApp).post("/auth/login/user")
                    .expect(200)
                    .then(function () { return done(); })
                    .catch(function (error) { return done.fail(error); });
            });
            it("should have called the right controllers", function () {
                expect(server.getDependency(AuthController).saveUser).toHaveBeenCalled();
                expect(server.getDependency(AuthController).login).not.toHaveBeenCalled();
            });
            it("should have called the right filters", function () {
                expect(server.getDependency("RootFilter").apply).toHaveBeenCalled();
                expect(server.getDependency("LoginFilter").apply).toHaveBeenCalled();
                expect(server.getDependency("UserFilter").apply).toHaveBeenCalled();
                expect(server.getDependency("AdminFilter").apply).not.toHaveBeenCalled();
            });
        });
        describe("/controllers", function () {
            describe("GET", function () {
                beforeEach(function (done) {
                    spyOn(server.getDependency(ControllerClass), "read").and.callThrough();
                    request(expressApp)
                        .get("/controllers")
                        .expect(200)
                        .then(function () { return done(); })
                        .catch(function (error) { return done.fail(error); });
                });
                it("should have called read", function () {
                    expect(server.getDependency(ControllerClass).read).toHaveBeenCalled();
                });
            });
            describe("POST override", function () {
                beforeEach(function (done) {
                    spyOn(server.getDependency(ControllerClass), "write").and.callThrough();
                    spyOn(server.getDependency(AuthController), "saveUser").and.callThrough();
                    request(expressApp)
                        .post("/controllers")
                        .expect(200)
                        .then(function () { return done(); })
                        .catch(function (error) { return done.fail(error); });
                });
                it("should not have called ControlClass method", function () {
                    expect(server.getDependency(ControllerClass).write).not.toHaveBeenCalled();
                });
                it("should not have called AuthController method", function () {
                    expect(server.getDependency(AuthController).saveUser).toHaveBeenCalled();
                });
            });
        });
        describe("with nested filters", function () {
            var filterQueue;
            beforeEach(function (done) {
                filterQueue = [];
                spyOn(server.getDependency("RootFilter"), "apply").and.callFake(function () {
                    filterQueue.push("RootFilter");
                });
                spyOn(server.getDependency("LoginFilter"), "apply").and.callFake(function () {
                    filterQueue.push("LoginFilter");
                });
                spyOn(server.getDependency("AfterLoginFilter"), "apply").and.callFake(function () {
                    filterQueue.push("AfterLoginFilter");
                });
                return request(expressApp).get("/auth/login")
                    .expect(200)
                    .then(function () { return done(); })
                    .catch(function (error) { return done.fail(error); });
            });
            it("filters should be called in the right order", function () {
                expect(filterQueue).toEqual(["RootFilter", "LoginFilter", "AfterLoginFilter"]);
            });
        });
        describe("and a controller throws an error", function () {
            beforeEach(function () {
                spyOn(server.getDependency(AuthController), "login").and.throwError("Error on controller.");
            });
            describe("and loginErrorHandler handles it", function () {
                var catchedError;
                beforeEach(function (done) {
                    spyOn(server.getDependency("LoginErrorHandler"), "catch").and.callFake(function (error, req, res) {
                        catchedError = error;
                        res.status(500).send("Error");
                    });
                    spyOn(server.getDependency("AuthErrorHandler"), "catch");
                    return request(expressApp).get("/auth/login")
                        .expect(500)
                        .then(function () { return done(); })
                        .catch(function (error) { return done.fail(error); });
                });
                it("loginErrorHandler #catch should have been called", function () {
                    expect(server.getDependency("LoginErrorHandler").catch).toHaveBeenCalled();
                });
                it("catchedError should be an ActionError", function () {
                    expect(catchedError).toEqual(jasmine.any(core_1.ActionError));
                });
                it("authErrorHandler #catch should not have been called", function () {
                    expect(server.getDependency("AuthErrorHandler").catch).not.toHaveBeenCalled();
                });
            });
            describe("and only RootErrorHandler handles it", function () {
                var errorHandlers;
                beforeEach(function (done) {
                    errorHandlers = [];
                    spyOn(server.getDependency("AfterLoginErrorHandler"), "catch").and.callFake(function (error, req, res) {
                        errorHandlers.push("AfterLoginErrorHandler");
                        throw error;
                    });
                    spyOn(server.getDependency("LoginErrorHandler"), "catch").and.callFake(function (error, req, res) {
                        errorHandlers.push("LoginErrorHandler");
                        throw error;
                    });
                    spyOn(server.getDependency("AuthErrorHandler"), "catch").and.callFake(function (error, req, res) {
                        errorHandlers.push("AuthErrorHandler");
                        throw error;
                    });
                    spyOn(server.getDependency("RootErrorHandler"), "catch").and.callFake(function (error, req, res) {
                        errorHandlers.push("RootErrorHandler");
                        res.status(500).end();
                    });
                    return request(expressApp).get("/auth/login")
                        .expect(500)
                        .then(function () { return done(); })
                        .catch(function (error) { return done.fail(error); });
                });
                it("all error handlers should be called", function () {
                    expect(server.getDependency("AfterLoginErrorHandler").catch).toHaveBeenCalled();
                    expect(server.getDependency("LoginErrorHandler").catch).toHaveBeenCalled();
                    expect(server.getDependency("AuthErrorHandler").catch).toHaveBeenCalled();
                    expect(server.getDependency("RootErrorHandler").catch).toHaveBeenCalled();
                });
                it("error handlers should have been called in the right order", function () {
                    expect(errorHandlers).toEqual([
                        "LoginErrorHandler",
                        "AfterLoginErrorHandler",
                        "AuthErrorHandler",
                        "RootErrorHandler",
                    ]);
                });
            });
        });
        describe("and LoginFilter throws an error", function () {
            var catchedError;
            beforeEach(function (done) {
                spyOn(server.getDependency("LoginFilter"), "apply").and.callFake(function () {
                    throw new Error("Filter error");
                });
                spyOn(server.getDependency("RootErrorHandler"), "catch").and.callFake(function (err, req, res) {
                    catchedError = err;
                    res.status(500).end();
                });
                return request(expressApp).get("/auth/login")
                    .expect(500)
                    .then(function () { return done(); })
                    .catch(function (error) { return done.fail(error); });
            });
            it("catchedError should be a FilterError", function () {
                expect(catchedError).toEqual(jasmine.any(core_1.FilterError));
            });
        });
        describe("and a login filter responds", function () {
            var response;
            beforeEach(function (done) {
                spyOn(server.getDependency(AuthController), "login");
                spyOn(server.getDependency("LoginFilter"), "apply").and.callFake(function (req, res) {
                    res.status(200).send("HIJACKED");
                });
                request(expressApp)
                    .get("/auth/login")
                    .expect(200)
                    .then(function (res) {
                    response = res;
                    done();
                })
                    .catch(done.fail);
            });
            it("filter should have responded", function () {
                expect(server.getDependency("LoginFilter").apply).toHaveBeenCalled();
                expect(response.text).toEqual("HIJACKED");
            });
            it("controller should have not been called", function () {
                expect(server.getDependency(AuthController).login).not.toHaveBeenCalled();
            });
        });
    });
});
