import { Service, ServiceMetadata, ServiceHelper } from "../../core";

describe("Service", () => {

    describe("@Service decorator:", () => {

        let serviceHelper: ServiceHelper;
        beforeEach(() => {
            serviceHelper = new ServiceHelper();
        });

        describe("when we have a non decorated class", () => {
            class AService { };
            it("metadata should not exist", () => {
                expect(serviceHelper.getMetadata(AService)).toBeUndefined();
            });
        });

        describe("when we have a decorated class", () => {
            @Service()
            class AService { }
            let filterMetadataDescriptor: ServiceMetadata;

            beforeEach(() => {
                filterMetadataDescriptor = serviceHelper.getMetadata(AService);
            });
            it("metadata should exist", () => {
                expect(filterMetadataDescriptor).toEqual(<ServiceMetadata> {
                    className: "AService",
                });
            });
        });
    });
});
