import {
    validateErrorHandler,
    ErrorHandler,
    ErrorHandlerError,
    TediError,
} from "../../core";

describe("ErrorHandler", () => {
    describe("when we have a valid errorHandler", () => {
        class AnErrorHandler implements ErrorHandler {
            catch() { return "dummy"; }
        }
        let validErrorHandle: ErrorHandler;
        beforeEach(() => {
            validErrorHandle = new AnErrorHandler();
        });
        describe("#validateErrorHandler", () => {
            it("should validate", () => {
                expect(() => validateErrorHandler(validErrorHandle)).not.toThrow();
            });
        });
    });
    describe("when we have an invalid errorHandler", () => {
        class InvalidErrorHandler { }
        let invalidErrorHandle: ErrorHandler;
        beforeEach(() => {
            invalidErrorHandle = <ErrorHandler>new InvalidErrorHandler();
        });
        describe("#validateErrorHandler", () => {
            it("should throw an error", (done: DoneFn) => {
                try {
                    validateErrorHandler(invalidErrorHandle);
                } catch (error) {
                    expect(error).toEqual(jasmine.any(ErrorHandlerError));
                    done();
                }
            });
        });
    });
});

describe("ErrorHandlerError", () => {
    it("should inherit from TediError", () => {
        expect(new ErrorHandlerError({}, "")).toEqual(jasmine.any(TediError));
    });
});
