'use strict';
import * as _ from 'lodash';

interface RoutePathData {
    path: string;
    controller: Object;
    controllerMethod: string;
}

export class RoutePath {
    
    private _methodMap: {[key: string]: RoutePathData} = {};
    private _childPaths: RoutePath[] = [];
    
    constructor(
        private _path: string) {    
    }
       
    get(controller: Object, controllerMethod: string): RoutePath {
      RoutePathUtils.assertControllerHasMethod(controller, controllerMethod);
      let pathId = RoutePathUtils.getPathId('GET', this._path);
      
      this._methodMap['GET'] = {
        path: this._path,
        controller: controller,
        controllerMethod: controllerMethod  
      };
      
      return this;
    }
    
    post(controller: Object, controllerMethod: string): RoutePath {
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

export class RoutePathUtils {
    
    static throwError(msg: string): void {
        throw new Error('RouterPath: ' + msg);
    }
    
    static assertControllerHasMethod(controller: Object, method: string) {
        if (!controller) {
            this.throwError('Invalid controller');
        }
        if (!controller[method]) {
            this.throwError('Invalid controller method: ' + method);
        }
    }
    
    static getPathId(method: string, path: string) {
        return `${method}#${path}`;
    }
    
}