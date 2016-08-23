"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var core_1 = require("../../core");
var TestError = (function (_super) {
    __extends(TestError, _super);
    function TestError(msg, error) {
        _super.call(this, msg, error);
    }
    return TestError;
}(core_1.CustomError));
describe("CustomError", function () {
    it("should work", function (done) {
        try {
            try {
                throw new Error("Test!");
            }
            catch (err) {
                throw new TestError("Custom Error", err);
            }
        }
        catch (err) {
            expect(err).toEqual(jasmine.any(TestError));
            var errorStack = err.stack;
            expect(errorStack).toContain("TestError: Custom Error");
            expect(errorStack).toContain("Caused By: Error: Test!");
            done();
        }
    });
});
