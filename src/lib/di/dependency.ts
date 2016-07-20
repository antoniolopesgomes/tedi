import {Constructor} from '../core';

export interface DependencyProperties {
    value?: any;
    class?: Constructor<any>;
    factory?: any; 
}

export function dependency(token: any, properties?: DependencyProperties): Dependency {
    return new Dependency(
        token,
        properties
    );
}

export class Dependency {
    constructor(
        public token: any,
        public properties: DependencyProperties
    ) {} 
}