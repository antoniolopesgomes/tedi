'use strict';
import {injectable} from '../modules';
import * as METADATA_KEYS from './constants/metadata-keys';
import * as ERRORS from './constants/error-messages';
import {CustomError} from '../core';

//CUSTOM ERRORS USED BY THIS MODULE

export class FilterDecoratorError extends CustomError {
    constructor(filterName: string, msg: string, error?: any) {
        super(`${filterName}': ${msg}`, error);
    }
}

//FILTER METADATA HELPER

export class FilterMetadata {
    isPresent(target: Object): boolean {
        return Reflect.hasMetadata(METADATA_KEYS.FILTER, target);
    }
}

//FILTER DECORATOR

export interface IFilterDecorator {
    (): (target: any) => void;
    metadata: FilterMetadata;
}

function FilterDecorator(): ClassDecorator {
    
    return function (target: Object) {
        try {
            injectable()(target);
            Reflect.defineMetadata(METADATA_KEYS.FILTER, true, target);
        }
        catch (error) {
            throw new FilterDecoratorError((<any>target).name, ERRORS.CONTROLLER_ERROR_DECORATING, error);
        }
    }
}

(<IFilterDecorator> FilterDecorator).metadata = new FilterMetadata();

export const Filter = <IFilterDecorator> FilterDecorator;