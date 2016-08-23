import { Constructor } from "../core";
export interface DependencyProperties {
    value?: any;
    class?: Constructor<any>;
    classIsTransient?: boolean;
}
export declare function dependency(token: any, properties?: DependencyProperties): DependencyInfo;
export declare class DependencyInfo {
    token: any;
    properties: DependencyProperties;
    constructor(token: any, properties: DependencyProperties);
}
