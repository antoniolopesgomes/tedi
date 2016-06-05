export {CoreRouter} from './CoreRouter';

export interface RouteAction {
    controller: Object,
    controllerMethod: string;
}

export class Route {
    path: string;
    filters: string[];
    errorHandlers: string[];
    children: Route[];
    //actions
    get: RouteAction;
    post: RouteAction;
    delete: RouteAction;
    put: RouteAction;
    //data
    data: any;
    
    constructor(path: string) {
        this.path = path;
        this.filters = [];
        this.errorHandlers = [];
        this.children = [];
        this.data = {};
    }
}

export interface Router {
    getRoutesConfiguration(): Route;
}

export interface RoutesDefinition {
    
}

export const ROUTE_KEYS: any = {
    'FILTERS': '$filters',
    'ERROR_HANDLERS': '$errorHandlers' 
}