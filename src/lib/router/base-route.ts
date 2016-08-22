import {Route, RouteAction, RouteFilter, RouteErrorHandler} from "./core";

export class BaseRoute implements Route {
    public path: string;
    public filters: RouteFilter[];
    public errorHandlers: RouteErrorHandler[];
    public children: Route[];
    // actions
    public get: RouteAction;
    public post: RouteAction;
    public delete: RouteAction;
    public put: RouteAction;

    constructor(path: string) {
        this.path = path;
    }

    public toString(): string {
        return `route: ${this.path}`;
    }
}
