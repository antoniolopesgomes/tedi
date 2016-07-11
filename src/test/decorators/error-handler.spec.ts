import {ErrorHandler} from '../../core';
import {ErrorHandlerMetadata} from '../../lib/error-handler';

describe('Filter decorator', () => {

    describe('when we have a non decorated class', () => {
        class AnErrorHandler { };
        it('should not be decorated', () => {
            expect(ErrorHandlerMetadata.isDecorated(AnErrorHandler)).toBeFalsy();
        });
    });

    describe('when we have a decorated class', () => {
        @ErrorHandler() class AnErrorHandler { };
        it('should be decorated', () => {
            expect(ErrorHandlerMetadata.isDecorated(AnErrorHandler)).toBeTruthy();
        });
    });

});