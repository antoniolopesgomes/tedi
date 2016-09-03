
import {TediError} from "../../core";

class TestError extends TediError {
    constructor(msg: string, error: any) {
        super(msg, error);
    }
}

describe("CustomError", () => {

    it("should work", (done: DoneFn) => {
        try {
            try {
                throw new Error("Test!");
            } catch (err) {
                throw new TestError("Custom Error", err);
            }
        } catch (err) {
            expect(err).toEqual(jasmine.any(TestError));
            let errorStack = (<Error> err).stack;
            expect(errorStack).toContain("TestError: Custom Error");
            expect(errorStack).toContain("Caused By: Error: Test!");
            done();
        }
    });

});
