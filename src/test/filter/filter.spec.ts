import { Filter, FilterMetadata, FilterUtils } from "../../lib/filter";

describe("Filter", () => {

    describe("@Filter decorator:", () => {

        describe("when we have a non decorated class", () => {
            class AFilter { };
            it("metadata should not exist", () => {
                expect(FilterUtils.getMetadata(AFilter)).toBeUndefined();
            });
        });

        describe("when we have a decorated class", () => {
            @Filter()
            class AFilter { }
            let filterMetadataDescriptor: FilterMetadata;

            beforeEach(() => {
                filterMetadataDescriptor = FilterUtils.getMetadata(AFilter);
            });
            it("metadata should exist", () => {
                expect(filterMetadataDescriptor).toEqual(<FilterMetadata> {
                    className: "AFilter",
                });
            });
        });

    });
});
