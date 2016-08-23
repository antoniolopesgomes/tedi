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
var core_1 = require("../../core");
describe("Module bindings", function () {
    var SimpleModule = (function (_super) {
        __extends(SimpleModule, _super);
        function SimpleModule() {
            _super.apply(this, arguments);
        }
        SimpleModule.prototype.init = function () { return; };
        return SimpleModule;
    }(core_1.BaseModule));
    describe("when we have a module", function () {
        var module;
        beforeEach(function () {
            module = new SimpleModule();
        });
        describe("and we register a dependency", function () {
            var SimpleService = (function () {
                function SimpleService() {
                }
                SimpleService = __decorate([
                    core_1.Service(), 
                    __metadata('design:paramtypes', [])
                ], SimpleService);
                return SimpleService;
            }());
            var service;
            beforeEach(function () {
                module.setDependency(SimpleService);
                service = module.getDependency(SimpleService);
            });
            it("should gives us the same instance", function () {
                expect(module.getDependency(SimpleService)).toEqual(service);
            });
        });
        // TODO check dependencies options
    });
});
