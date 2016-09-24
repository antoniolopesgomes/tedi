import { ErrorHandler, ErrorHandlerMetadata, ErrorHandlerUtils } from "../../lib/error-handler";

describe("ErrorHandler", () => {

    describe("@Filter decorator", () => {

        describe("when we have a non decorated class", () => {
            class AnErrorHandler { };
            it("metadata should not exist", () => {
                expect(ErrorHandlerUtils.getMetadata(AnErrorHandler)).toBeUndefined();
            });
        });

        describe("when we have a decorated class", () => {
            @ErrorHandler()
            class AnErrorHandler { };
            let errorHandlerMetadataDescriptor: ErrorHandlerMetadata;

            beforeEach(() => {
                errorHandlerMetadataDescriptor = ErrorHandlerUtils.getMetadata(AnErrorHandler);
            });
            it("metadata should exist", () => {
                expect(errorHandlerMetadataDescriptor).toEqual(<ErrorHandlerMetadata> {
                    className: "AnErrorHandler",
                });
            });
        });

    });
});
