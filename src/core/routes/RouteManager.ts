import * as _ from 'lodash';
import {Route} from './Route';
import {RoutePath} from './Path';
import {Global} from '../Global';

export interface RouteManager {
    getRoutesConfiguration(routes: any): RouteConfig;
}

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

export class CoreRouteManager implements RouteManager {
    
    getRoutesConfiguration(routes: any): RouteConfig {
        let root = <RouteConfig> { path: 'ROOT' };
        buildRouteConfig(routes, root);
        return root;
    }
    
}

//UTILS

function buildRouteConfig(routes: any, routeConfig: RouteConfig): void {
    Object.keys(routes).forEach((key: string) => {
        if (key.startsWith('/')) {
            let childRouteConfig = <RouteConfig> {
                path: key,
                children: []
            };
            routeConfig.children.push(childRouteConfig);
            fillRouteConfig(routes[key], childRouteConfig);
            buildRouteConfig(routes[key], childRouteConfig);
        }
    })
}

function fillRouteConfig(route: any, routeConfig: RouteConfig): void {
    routeConfig.filters = route.filters || [];
    routeConfig.get = getRouteAction(route.get);
    routeConfig.post = getRouteAction(route.post);
    routeConfig.delete = getRouteAction(route.delete);
    routeConfig.put = getRouteAction(route.put);
}

function getRouteAction(routeAction: string[]): RouteActionConfig {
    
    if (!routeAction) {
        return undefined;
    }
    
    if (!_.isArray(routeAction) || routeAction.length < 2) {
        throwError('action should have two string fields [controller, controllerMethod]');
    }
    
    let controllerName = routeAction[0];
    let methodName = routeAction[1];
    
    let controller: Object = Global.getController(controllerName);
    if (!_.isFunction(controller[methodName])) {
        throwError('invalid controller action');
    }
    
    return {
        controller: controller,
        controllerMethod: methodName
    }
}

function throwError(path): void {
    throw new Error(`Router: invalid route`)
}
