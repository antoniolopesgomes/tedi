import { ErrorHandler } from "../../core";
import { ErrorHandlerMetadata, ErrorHandlerMetadataDescriptor } from "../../lib/error-handler";

fdescribe("ErrorHandler", () => {

    describe("@Filter decorator", () => {

        describe("when we have a non decorated class", () => {
            class AnErrorHandler { };
            it("metadata should not exist", () => {
                expect(ErrorHandlerMetadata.getMetadata(AnErrorHandler)).toBeUndefined();
            });
        });

        describe("when we have a decorated class", () => {
            @ErrorHandler()
            class AnErrorHandler { };
            let errorHandlerMetadataDescriptor: ErrorHandlerMetadataDescriptor;

            beforeEach(() => {
                errorHandlerMetadataDescriptor = ErrorHandlerMetadata.getMetadata(AnErrorHandler);
            });
            it("metadata should exist", () => {
                expect(errorHandlerMetadataDescriptor).toEqual(<ErrorHandlerMetadataDescriptor> {
                    service: {
                        className: "AnErrorHandler",
                    },
                });
            });
        });

    });
});
