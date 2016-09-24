import { Service, ServiceMetadata, getMetadata} from "../../lib/service";

fdescribe("Service", () => {

    describe("@Service decorator:", () => {

        describe("when we have a non decorated class", () => {
            class AService { };
            it("metadata should not exist", () => {
                expect(getMetadata(AService)).toBeUndefined();
            });
        });

        describe("when we have a decorated class", () => {
            @Service()
            class AService { }
            let filterMetadataDescriptor: ServiceMetadata;

            beforeEach(() => {
                filterMetadataDescriptor = getMetadata(AService);
            });
            it("metadata should exist", () => {
                expect(filterMetadataDescriptor).toEqual(<ServiceMetadata>{
                    className: "AFilter",
                });
            });
        });

    });
});
