import { Route, RouteAction, RouteFilter, RouteErrorHandler } from "./core";
export declare class BaseRoute implements Route {
    path: string;
    filters: RouteFilter[];
    errorHandlers: RouteErrorHandler[];
    children: Route[];
    get: RouteAction;
    post: RouteAction;
    delete: RouteAction;
    put: RouteAction;
    constructor(path: string);
    toString(): string;
}
