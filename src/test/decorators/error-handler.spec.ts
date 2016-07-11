import {ErrorHandler} from '../../core';

describe('Filter decorator', () => {

    describe('when we have a non decorated class', () => {
        class AnErrorHandler { };
        it('should not be decorated', () => {
            expect(ErrorHandler.metadata.isPresent(AnErrorHandler)).toBeFalsy();
        });
    });

    describe('when we have a decorated class', () => {
        @ErrorHandler() class AnErrorHandler { };
        it('should be decorated', () => {
            expect(ErrorHandler.metadata.isPresent(AnErrorHandler)).toBeTruthy();
        });
    });

});