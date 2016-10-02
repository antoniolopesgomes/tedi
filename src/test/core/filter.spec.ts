import {
    validateFilter,
    Filter,
    FilterError,
    TediError,
} from "../../core";

describe("Filter", () => {
    describe("when we have a valid filter", () => {
        class ValidFilter implements Filter<any> {
            apply() { return; }
            getDataFromRequest() { return; }
        }
        let validFilter: Filter<any>;
        beforeEach(() => {
            validFilter = new ValidFilter();
        });
        describe("#validateFilter", () => {
            it("should validate", () => {
                expect(() => validateFilter(validFilter)).not.toThrow();
            });
        });
    });
    describe("when we have an invalid filter", () => {
        class InvalidFilter { }
        let invalidFilter: Filter<any>;
        beforeEach(() => {
            invalidFilter = <Filter<any>> new InvalidFilter();
        });
        describe("#validateFilter", () => {
            it("should throw an error", (done: DoneFn) => {
                try {
                    validateFilter(invalidFilter);
                } catch (error) {
                    expect(error).toEqual(jasmine.any(FilterError));
                    done();
                }
            });
        });
    });
});

describe("FilterError", () => {
    it("should inherit from TediError", () => {
        expect(new FilterError({}, "")).toEqual(jasmine.any(TediError));
    });
});
