'use strict';
const express = require('express');
const Promise = require('bluebird');
class ExpressApplication {
    constructor(_config, _router) {
        this._config = _config;
        this._router = _router;
        if (!this._config) {
            throw new Error('Application: No config was found.');
        }
        this._app = express();
    }
    listen() {
        return new Promise((resolve, reject) => {
            this._server = this._app.listen(this._config.server.port, (error) => { return error ? reject(error) : resolve(); });
        });
    }
    close() {
        return new Promise((resolve, reject) => {
            if (!this._server) {
                return resolve();
            }
            this._server.close((error) => {
                this._server = null;
                return error ? reject(error) : resolve();
            });
        });
    }
    configureRoutes() {
        //let routes = this._routeManager.getRoutesConfiguration({});
        return Promise.resolve();
    }
}
function addRoute(app, routeConfig) {
    let router = express.Router();
    //filters
    let filters = routeConfig.filters.map((filter) => {
        return (req, res, next) => {
            Promise
                .resolve(true)
                .then(() => {
                return filter.apply(req, res);
            })
                .then(() => next())
                .catch((error) => next(error));
        };
    });
    router.use.apply(router, filters);
    //Actions
    //get
    if (routeConfig.get) {
        addAction(router, routeConfig, 'get');
    }
    //post
    if (routeConfig.post) {
        addAction(router, routeConfig, 'post');
    }
    //put
    if (routeConfig.put) {
        addAction(router, routeConfig, 'put');
    }
    //delete
    if (routeConfig.delete) {
        addAction(router, routeConfig, 'delete');
    }
    return router;
}
function addAction(router, routeConfig, method) {
    let routerAction = routeConfig[method];
    router[method](routeConfig.path, (req, res, next) => {
        let controller = routerAction.controller;
        let methodName = routerAction.controllerMethod;
        Promise
            .resolve(true)
            .then(() => {
            return controller[methodName](req, res);
        })
            .then(() => next())
            .catch((error) => next(error));
    });
}
