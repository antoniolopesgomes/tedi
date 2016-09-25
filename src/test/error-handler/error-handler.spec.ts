import { tedi, ErrorHandlerMetadata, ErrorHandlerHelper } from "../../core";

describe("ErrorHandler", () => {

    describe("Filter decorator", () => {

        let errorHandlerHelper: ErrorHandlerHelper;
        beforeEach(() => {
            errorHandlerHelper = new ErrorHandlerHelper();
        });

        describe("when we have a non decorated class", () => {
            class AnErrorHandler { };
            it("metadata should not exist", () => {
                expect(errorHandlerHelper.getMetadata(AnErrorHandler)).toBeUndefined();
            });
        });

        describe("when we have a decorated class", () => {
            @tedi.errorHandler()
            class AnErrorHandler { }
            let errorHandlerMetadataDescriptor: ErrorHandlerMetadata;

            beforeEach(() => {
                errorHandlerMetadataDescriptor = errorHandlerHelper.getMetadata(AnErrorHandler);
            });
            it("metadata should exist", () => {
                expect(errorHandlerMetadataDescriptor).toEqual(<ErrorHandlerMetadata> {
                    className: "AnErrorHandler",
                });
            });
        });

    });
});
