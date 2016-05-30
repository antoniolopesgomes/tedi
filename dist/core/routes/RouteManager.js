"use strict";
const _ = require('lodash');
const Global_1 = require('../Global');
class CoreRouteManager {
    getRoutesConfiguration(routes) {
        let root = { path: 'ROOT' };
        buildRouteConfig(routes, root);
        return root;
    }
}
exports.CoreRouteManager = CoreRouteManager;
//UTILS
function buildRouteConfig(routes, routeConfig) {
    Object.keys(routes).forEach((key) => {
        if (key.startsWith('/')) {
            let childRouteConfig = {
                path: key,
                children: []
            };
            routeConfig.children.push(childRouteConfig);
            fillRouteConfig(routes[key], childRouteConfig);
            buildRouteConfig(routes[key], childRouteConfig);
        }
    });
}
function fillRouteConfig(route, routeConfig) {
    routeConfig.filters = route.filters || [];
    routeConfig.get = getRouteAction(route.get);
    routeConfig.post = getRouteAction(route.post);
    routeConfig.delete = getRouteAction(route.delete);
    routeConfig.put = getRouteAction(route.put);
}
function getRouteAction(routeAction) {
    if (!routeAction) {
        return undefined;
    }
    if (!_.isArray(routeAction) || routeAction.length < 2) {
        throwError('action should have two string fields [controller, controllerMethod]');
    }
    let controllerName = routeAction[0];
    let methodName = routeAction[1];
    let controller = Global_1.Global.getController(controllerName);
    if (!_.isFunction(controller[methodName])) {
        throwError('invalid controller action');
    }
    return {
        controller: controller,
        controllerMethod: methodName
    };
}
function throwError(path) {
    throw new Error(`Router: invalid route`);
}
