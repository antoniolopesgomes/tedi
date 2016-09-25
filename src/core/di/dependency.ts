import {Constructor} from "../interfaces";

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
    public token: any;
    public properties: DependencyProperties;

    constructor(
        token: any,
        properties: DependencyProperties
    ) {
        this.token = token;
        this.properties = properties || <DependencyProperties> {
            class: token,
        };
    }
}
