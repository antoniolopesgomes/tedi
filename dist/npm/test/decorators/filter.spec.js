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
var filter_1 = require("../../lib/filter");
describe("Filter decorator", function () {
    describe("when we have a non decorated class", function () {
        var AFilter = (function () {
            function AFilter() {
            }
            return AFilter;
        }());
        ;
        it("should not be decorated", function () {
            expect(filter_1.FilterMetadata.isDecorated(AFilter)).toBeFalsy();
        });
    });
    describe("when we have a decorated class", function () {
        var AFilter = (function () {
            function AFilter() {
            }
            AFilter = __decorate([
                core_1.Filter(), 
                __metadata('design:paramtypes', [])
            ], AFilter);
            return AFilter;
        }());
        ;
        it("should be decorated", function () {
            expect(filter_1.FilterMetadata.isDecorated(AFilter)).toBeTruthy();
        });
    });
});
