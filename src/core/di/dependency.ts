import { Constructor } from "../utils";
import { DIToken } from "./core";

export interface DependencyProperties {
    value?: any;
    class?: Constructor<any>;
    classIsTransient?: boolean;
}

export function dependency<T>(token: DIToken<T>, properties?: DependencyProperties): DependencyInfo {
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
