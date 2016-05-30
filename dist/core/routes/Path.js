'use strict';
class RoutePath {
    constructor(_path) {
        this._path = _path;
        this._methodMap = {};
        this._childPaths = [];
    }
    get(controller, controllerMethod) {
        RoutePathUtils.assertControllerHasMethod(controller, controllerMethod);
        let pathId = RoutePathUtils.getPathId('GET', this._path);
        this._methodMap['GET'] = {
            path: this._path,
            controller: controller,
            controllerMethod: controllerMethod
        };
        return this;
    }
    post(controller, controllerMethod) {
        RoutePathUtils.assertControllerHasMethod(controller, controllerMethod);
        let pathId = RoutePathUtils.getPathId('POST', this._path);
        this._methodMap['POST'] = {
            path: this._path,
            controller: controller,
            controllerMethod: controllerMethod
        };
        return this;
    }
}
exports.RoutePath = RoutePath;
class RoutePathUtils {
    static throwError(msg) {
        throw new Error('RouterPath: ' + msg);
    }
    static assertControllerHasMethod(controller, method) {
        if (!controller) {
            this.throwError('Invalid controller');
        }
        if (!controller[method]) {
            this.throwError('Invalid controller method: ' + method);
        }
    }
    static getPathId(method, path) {
        return `${method}#${path}`;
    }
}
exports.RoutePathUtils = RoutePathUtils;
