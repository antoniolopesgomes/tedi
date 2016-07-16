import {Route, RouteAction, RouteFilter, RouteErrorHandler, ROUTE_KEYS, RouteError} from './core';
import {BaseModule} from '../module';
import {CustomError} from '../core';
import {BaseFilter} from '../filter';
import {BaseErrorHandler} from '../error-handler';

export class BaseRoute implements Route {
    path: string;
    filters: RouteFilter[];
    errorHandlers: RouteErrorHandler[];
    children: Route[];
    //actions
    get: RouteAction;
    post: RouteAction;
    delete: RouteAction;
    put: RouteAction;

    constructor(path: string) {
        this.path = path;
    }

    toString(): string {
        return `route: ${this.path}`;
    }
}