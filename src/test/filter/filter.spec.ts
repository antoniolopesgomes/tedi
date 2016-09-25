import { tedi, FilterMetadata, FilterHelper } from "../../core";

describe("Filter", () => {

    describe("Filter decorator:", () => {

        let filterHelper: FilterHelper;
        beforeEach(() => {
            filterHelper = new FilterHelper();
        });

        describe("when we have a non decorated class", () => {
            class AFilter { };
            it("metadata should not exist", () => {
                expect(filterHelper.getMetadata(AFilter)).toBeUndefined();
            });
        });

        describe("when we have a decorated class", () => {
            @tedi.filter()
            class AFilter { }
            let filterMetadataDescriptor: FilterMetadata;

            beforeEach(() => {
                filterMetadataDescriptor = filterHelper.getMetadata(AFilter);
            });
            it("metadata should exist", () => {
                expect(filterMetadataDescriptor).toEqual(<FilterMetadata> {
                    className: "AFilter",
                });
            });
        });

    });
});
