import {Filter, BaseModule} from '../../core';
import {FilterMetadata} from '../../lib/filter';

describe('Filter decorator', () => {

    describe('when we have a non decorated class', () => {
        class AFilter { };
        it('should not be decorated', () => {
            expect(FilterMetadata.isDecorated(AFilter)).toBeFalsy();
        });
    });

    describe('when we have a decorated class', () => {
        @Filter() class AFilter { };
        it('should be decorated', () => {
            expect(FilterMetadata.isDecorated(AFilter)).toBeTruthy();
        });
    });

});