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
var controller_1 = require("../../lib/controller");
describe("Controller decorators", function () {
    describe("Controller decorations", function () {
        describe("when we have a non decorated class", function () {
            var AController = (function () {
                function AController() {
                }
                return AController;
            }());
            ;
            it("should not be decorated", function () {
                expect(controller_1.ControllerMetadata.isDecorated(AController)).toBeFalsy();
            });
        });
        describe("when we have a decorated class", function () {
            var AController = (function () {
                function AController() {
                }
                AController = __decorate([
                    core_1.Controller(), 
                    __metadata('design:paramtypes', [])
                ], AController);
                return AController;
            }());
            ;
            it("should be decorated", function () {
                expect(controller_1.ControllerMetadata.isDecorated(AController)).toBeTruthy();
            });
        });
    });
    describe("Controller actions decorations", function () {
        describe("when we have a valid decoration", function () {
            var controller;
            beforeEach(function () {
                var AController = (function () {
                    function AController() {
                    }
                    AController.prototype.read = function () { return "READ"; };
                    AController.prototype.create = function () { return "CREATE"; };
                    AController.prototype.update = function () { return "UPDATE"; };
                    AController.prototype.delete = function () { return "DELETE"; };
                    __decorate([
                        core_1.Controller.get(), 
                        __metadata('design:type', Function), 
                        __metadata('design:paramtypes', []), 
                        __metadata('design:returntype', String)
                    ], AController.prototype, "read", null);
                    __decorate([
                        core_1.Controller.post(), 
                        __metadata('design:type', Function), 
                        __metadata('design:paramtypes', []), 
                        __metadata('design:returntype', String)
                    ], AController.prototype, "create", null);
                    __decorate([
                        core_1.Controller.put(), 
                        __metadata('design:type', Function), 
                        __metadata('design:paramtypes', []), 
                        __metadata('design:returntype', String)
                    ], AController.prototype, "update", null);
                    __decorate([
                        core_1.Controller.delete(), 
                        __metadata('design:type', Function), 
                        __metadata('design:paramtypes', []), 
                        __metadata('design:returntype', String)
                    ], AController.prototype, "delete", null);
                    AController = __decorate([
                        core_1.Controller(), 
                        __metadata('design:paramtypes', [])
                    ], AController);
                    return AController;
                }());
                controller = new AController();
            });
            describe("GET decoration", function () {
                var methodName;
                beforeEach(function () {
                    methodName = controller_1.ControllerMetadata.GET(controller).name;
                });
                it("should have stored the GET method name", function () {
                    expect(methodName).toEqual("read");
                });
                it("we should be able to call the GET method", function () {
                    expect(controller[methodName]()).toEqual("READ");
                });
            });
            describe("POST decoration", function () {
                var methodName;
                beforeEach(function () {
                    methodName = controller_1.ControllerMetadata.POST(controller).name;
                });
                it("should have stored the POST method name", function () {
                    expect(methodName).toEqual("create");
                });
                it("we should be able to call the POST method", function () {
                    expect(controller[methodName]()).toEqual("CREATE");
                });
            });
            describe("PUT decoration", function () {
                var methodName;
                beforeEach(function () {
                    methodName = controller_1.ControllerMetadata.PUT(controller).name;
                });
                it("should have stored the PUT method name", function () {
                    expect(methodName).toEqual("update");
                });
                it("we should be able to call the PUT method", function () {
                    expect(controller[methodName]()).toEqual("UPDATE");
                });
            });
            describe("DELETE decoration", function () {
                var methodName;
                beforeEach(function () {
                    methodName = controller_1.ControllerMetadata.DELETE(controller).name;
                });
                it("should have stored the DELETE method name", function () {
                    expect(methodName).toEqual("delete");
                });
                it("we should be able to call the DELETE method", function () {
                    expect(controller[methodName]()).toEqual("DELETE");
                });
            });
        });
    });
    describe("Invalid decorations", function () {
        describe("when we have duplicate action decorations", function () {
            var error;
            beforeEach(function () {
                try {
                    var AController = (function () {
                        function AController() {
                        }
                        AController.prototype.read = function () { return; };
                        AController.prototype.anotherRead = function () { return; };
                        __decorate([
                            core_1.Controller.get(), 
                            __metadata('design:type', Function), 
                            __metadata('design:paramtypes', []), 
                            __metadata('design:returntype', void 0)
                        ], AController.prototype, "read", null);
                        __decorate([
                            core_1.Controller.get(), 
                            __metadata('design:type', Function), 
                            __metadata('design:paramtypes', []), 
                            __metadata('design:returntype', void 0)
                        ], AController.prototype, "anotherRead", null);
                        AController = __decorate([
                            core_1.Controller(), 
                            __metadata('design:paramtypes', [])
                        ], AController);
                        return AController;
                    }());
                }
                catch (err) {
                    error = err;
                }
            });
            it("should throw an error", function () {
                expect(error).toEqual(jasmine.any(controller_1.ControllerActionDecoratorError));
            });
        });
    });
});
