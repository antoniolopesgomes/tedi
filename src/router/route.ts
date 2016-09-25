import { Route, RouteActions, RouteFilter, RouteErrorHandler } from "../core/router";

export class TediRoute implements Route {
    public path: string;
    public filters: RouteFilter[];
    public errorHandlers: RouteErrorHandler[];
    public actions: RouteActions;
    public children: Route[];

    constructor(path: string) {
        this.path = path;
    }

    public toString(): string {
        return `route: ${this.path}`;
    }
}
