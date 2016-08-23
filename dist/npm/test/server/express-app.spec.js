"use strict";
var request = require("supertest-as-promised");
var express = require("express");
describe("Express app", function () {
    var userRouter;
    var infoRouter;
    var app;
    var controller;
    beforeEach(function () {
        userRouter = express.Router();
        infoRouter = express.Router();
        app = express();
        controller = {
            fn: function (req, res, next) {
                res.status(200).send("ok");
            },
        };
        var controllerWrapper = function (req, res, next) {
            controller.fn(req, res, next);
        };
        infoRouter.route("/").get(controllerWrapper);
        userRouter.route("/").get(controllerWrapper);
        userRouter.use("/info", infoRouter);
        app.use("/user", userRouter);
    });
    describe("when error handlers are chained in the app", function () {
        var response;
        beforeEach(function (done) {
            app
                .use("/user/info", function (err, req, res, next) {
                err.$handlers.push("info error handler");
                next(err);
            })
                .use("/user", function (err, req, res, next) {
                err.$handlers.push("user error handler");
                next(err);
            })
                .use(function (err, req, res, next) {
                err.$handlers.push("app error handler");
                res.status(500).send(err.$handlers);
            });
            spyOn(controller, "fn").and.callFake(function (req, res, next) {
                next({ $handlers: [] });
            });
            request(app)
                .get("/user/info")
                .expect(500)
                .then(function (res) {
                response = res;
                done();
            })
                .catch(function (error) { return done.fail(error); });
        });
        it("should have transversed all the error handlers", function () {
            expect(JSON.parse(response.text)).toEqual([
                "info error handler",
                "user error handler",
                "app error handler",
            ]);
        });
    });
    describe("when error handlers are setted in the routers", function () {
        var response;
        var infoFlag = false;
        var userFlag = false;
        var rootFlag = false;
        beforeEach(function (done) {
            infoRouter.use(function (err, req, res, next) {
                infoFlag = true;
                next(err);
            });
            userRouter.use(function (err, req, res, next) {
                userFlag = true;
                next(err);
            });
            app.use(function (err, req, res, next) {
                rootFlag = true;
                res.status(500).send(err.$handlers);
            });
            spyOn(controller, "fn").and.callFake(function (req, res, next) {
                next(new Error("Custom"));
            });
            request(app)
                .get("/user/info")
                .expect(500)
                .then(function (res) {
                response = res;
                done();
            })
                .catch(function (error) { return done.fail(error); });
        });
        it("should have transversed all the error handlers", function () {
            expect(rootFlag).toBeTruthy();
            expect(userFlag).toBeTruthy();
            expect(infoFlag).toBeTruthy();
        });
    });
    describe("when filters are setted in the routers", function () {
        var response;
        var infoFlag = false;
        var userFlag = false;
        var rootFlag = false;
        beforeEach(function (done) {
            userRouter = express.Router();
            infoRouter = express.Router();
            app = express();
            controller = {
                fn: function (req, res, next) {
                    res.status(200).send("ok");
                },
            };
            var controllerWrapper = function (req, res, next) {
                controller.fn(req, res, next);
            };
            infoRouter.route("/").get(controllerWrapper);
            userRouter.use(function (req, res, next) {
                userFlag = true;
                next();
            });
            userRouter.route("/").get(controllerWrapper);
            userRouter.use("/info", infoRouter);
            app.use(function (req, res, next) {
                rootFlag = true;
                next();
            });
            app.use("/user", userRouter);
            infoRouter.use(function (req, res, next) {
                infoFlag = true;
                next();
            });
            spyOn(controller, "fn").and.callFake(function (req, res, next) {
                res.status(200).send("OK");
            });
            request(app)
                .get("/user/info")
                .expect(200)
                .then(function (res) {
                response = res;
                done();
            })
                .catch(function (error) { return done.fail(error); });
        });
        it("should have called root filter", function () {
            expect(rootFlag).toBeTruthy();
        });
        it("should have called user filter", function () {
            expect(userFlag).toBeTruthy();
        });
    });
});
