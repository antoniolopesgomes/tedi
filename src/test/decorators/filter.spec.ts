import {Filter, Module} from '../../core';

describe('Filter decorator', () => {

    describe('when we have a non decorated class', () => {
        class AFilter { };
        it('should not be decorated', () => {
            expect(Filter.metadata.isPresent(AFilter)).toBeFalsy();
        });
    });

    describe('when we have a decorated class', () => {
        @Filter() class AFilter { };
        it('should be decorated', () => {
            expect(Filter.metadata.isPresent(AFilter)).toBeTruthy();
        });
    });

});