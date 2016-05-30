export interface RouteActionConfig {
    controller: Object,
    controllerMethod: string;
}

export interface RouteConfig {
    path: string;
    filters: string[],
    get: RouteActionConfig,
    post: RouteActionConfig,
    delete: RouteActionConfig,
    put: RouteActionConfig,
    children: RouteConfig[];
}