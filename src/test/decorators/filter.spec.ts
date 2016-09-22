import { Filter } from "../../core";
import { FilterMetadata, FilterMetadataDescriptor } from "../../lib/filter";

describe("Filter", () => {

    describe("@Filter decorator:", () => {

        describe("when we have a non decorated class", () => {
            class AFilter { };
            it("metadata should not exist", () => {
                expect(FilterMetadata.getMetadata(AFilter)).toBeUndefined();
            });
        });

        describe("when we have a decorated class", () => {
            @Filter()
            class AFilter { }
            let filterMetadataDescriptor: FilterMetadataDescriptor;

            beforeEach(() => {
                filterMetadataDescriptor = FilterMetadata.getMetadata(AFilter);
            });
            it("metadata should exist", () => {
                expect(filterMetadataDescriptor).toEqual(<FilterMetadataDescriptor>{
                    service: {
                        className: "AFilter",
                    },
                });
            });
        });

    });
});
