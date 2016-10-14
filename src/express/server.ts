import * as express from "express";
import * as http from "http";

import {
    Module,
    dependency,
    Config, CONFIG,
    Logger, LOGGER,
    Router, ROUTER,
    RouteActionsBuilder, ROUTE_ACTIONS_BUILDER } from "../core";
import { Injectable } from "../decorators";

import { WinstonLoggerFactory } from "../logger/winston-logger";
import { TediRouter, DefaultRouteActionsBuilder } from "../router";
import { ExpressApp, EXPRESS_APP } from "./app";

@Injectable()
export class ExpressServer extends Module {

    private _server: http.Server;
    private _app: express.Application;

    constructor() {
        super();
        // Define empty routing by default
        this.setJsonRoutes({});
        // Set default dependencies
        this.dependencies(
            dependency("Server", { value: this }),
            dependency<ExpressApp>(EXPRESS_APP, { class: ExpressApp }),
            dependency<Router>(ROUTER, { class: TediRouter }),
            dependency<RouteActionsBuilder>(ROUTE_ACTIONS_BUILDER, { class: DefaultRouteActionsBuilder }),
            dependency<Logger>(LOGGER, { class: WinstonLoggerFactory() }),
            dependency<Config>(CONFIG, { value: { port: 8080 } })
        );
    }

    public setConfig(config: Config): ExpressServer {
        this.setDependency(dependency(CONFIG, { value: config }));
        return this;
    }

    public getConfig(): Config {
        return this.getDependency<Config>(CONFIG);
    }

    public getLogger(): Logger {
        return this.getDependency<Logger>(LOGGER);
    }

    public getApp(): express.Application {
        if (!this._app) {
            let jsonRoutes = this.getJsonRoutes();
            let appBuilder = this.getDependency<ExpressApp>(EXPRESS_APP);
            this._app = appBuilder.buildApp(jsonRoutes, this);
        }
        return this._app;
    }

    public run(): Promise<http.Server> {
        let config = this.getConfig();
        let logger = this.getLogger();
        return new Promise<http.Server>((resolve, reject) => {
            this._server = this.getApp().listen(config.port, (error) => {
                return error ? reject(error) : resolve(this._server);
            });
        }).then((httpServer: http.Server) => {
            logger.debug(`Server running on port: ${config.port}...`);
            return this._server;
        });
    }

    public stop(): Promise<any> {
        let logger = this.getLogger();
        return new Promise((resolve, reject) => {
            if (!this._server) {
                logger.debug("#stop called but no running server exists");
            }
            this._server.close((error) => {
                return error ? reject(error) : resolve();
            });
        }).then(() => {
            this._server = null;
            logger.debug(`Server stopped`);
        });
    }

}
