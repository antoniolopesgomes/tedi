import {Constructor} from '../core';

export interface DependencyProperties {
    value?: any; 
    class?: Constructor<any>;
    classIsTransient?: boolean;
}

export function dependency(token: any, properties?: DependencyProperties): DependencyInfo {
    return new DependencyInfo(
        token,
        properties
    );
}

export class DependencyInfo {
    token: any;
    properties: DependencyProperties;
    
    constructor(
        token: any,
        properties: DependencyProperties
    ) {
        this.token = token;
        this.properties = properties || <DependencyProperties> {
            class: token
        };
    } 
}