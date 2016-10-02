
import { TediError } from "../../core";
import { getClassName } from "../../core/utils";

class TestError extends TediError {
    constructor(msg: string, error: any) {
        super(msg, error);
    }
}

describe("CustomError", () => {
    let customError: TediError;
    let plainError: Error;
    let plainErrorMessage = "plain error message";
    let customErrorMessage = "custom error message";
    beforeEach((done: DoneFn) => {
        try {
            try {
                plainError = new Error(plainErrorMessage);
                throw plainError;
            } catch (err) {
                throw new TestError(customErrorMessage, err);
            }
        } catch (err) {
            customError = err;
            done();
        }
    });

    it("should be the expected type", () => {
        expect(customError).toEqual(jasmine.any(TestError));
    });
    it("stack should be valid", () => {
        let errorStack = customError.stack;
        expect(errorStack).toContain(`TestError: ${customErrorMessage}`);
        expect(errorStack).toContain(`Caused By: Error: ${plainErrorMessage}`);
    });
    it("message stack should be valid", () => {
        expect(customError.messageStack).toEqual([
            `${getClassName(TestError)}: ${customErrorMessage}`,
            `${getClassName(Error)}: ${plainErrorMessage}`,
        ].join(" -> "));
    });
    it("getRootCause should work", () => {
        expect(customError.getRootCause()).toEqual(plainError);
    });
    it("search should work", () => {
        expect(customError.search(Error)).toEqual(plainError);
        expect(customError.search(TestError)).toEqual(customError);
    });

});
