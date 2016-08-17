import {FilterMetadata} from './filter-metadata';
import {CustomError} from '../core';
import {BindingOptions, BindingContext} from '../di';
import {BaseFilter} from './core';
import {isFunction} from 'lodash';

export class FilterValidatorError extends CustomError {
    constructor(filter: BaseFilter<any>, msg: string, error?: any) {
        super(`${(<any>filter).constructor.name}: ${msg}`, error);
    }
} 

export class FilterValidator {
    static hasValidMetadata(filter: BaseFilter<any>): boolean {
        return FilterMetadata.isDecorated(filter.constructor);
    }
    static implementsFilter(filter: BaseFilter<any>): boolean {
        return isFunction(filter.apply) && isFunction(filter.getDataFromRequest);
    }
    static validate(filter: BaseFilter<any>): void {
        //check if it implements BaseFilter
        if (!this.implementsFilter(filter)) {
            throw new FilterValidatorError(filter, 'must implement \'BaseFilter\'');
        }
        //check if it was valid metadata
        if (!this.hasValidMetadata(filter)) {
            throw new FilterValidatorError(filter, 'must be decorated with @Filter');
        }
    }
}