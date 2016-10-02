import * as express from "express";
import * as http from "http";

import * as core from "../core";
import { Injectable } from "../decorators";

import { WinstonLoggerFactory } from "../logger/winston-logger";
import { TediRouter, TediRouteActionsBuilder } from "../router";
import { ExpressAppBuilder } from "./express-app-builder";

@Injectable()
export class ExpressServer extends core.Module {

    private _server: http.Server;
    private _app: express.Application;

    constructor() {
        super();
        this.dependencies(
            core.dependency("Server", { value: this }),
            core.dependency("ExpressAppBuilder", { class: ExpressAppBuilder }),
            core.dependency("Router", { class: TediRouter }),
            core.dependency("RouteActionsBuilder", { class: TediRouteActionsBuilder }),
            core.dependency("Logger", { class: WinstonLoggerFactory() }),
            core.dependency("Config", { value: { port: 8080 } })
        );
    }

    public setConfig(config: core.Config): ExpressServer {
        this.setDependency(core.dependency("Config", { value: config }));
        return this;
    }

    public getConfig(): core.Config {
        return this.getDependency<core.Config>("Config");
    }

    public getApp(): express.Application {
        if (!this._app) {
            let jsonRoutes = this.getJsonRoutes();
            let appBuilder = this.getDependency<ExpressAppBuilder>("ExpressAppBuilder");
            this._app = appBuilder.buildApp(jsonRoutes, this);
        }
        return this._app;
    }

    public run(): Promise<http.Server> {
        let config = this.getDependency<core.Config>("Config");
        let logger = this.getDependency<core.Logger>("Logger");
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
        let logger = this.getDependency<core.Logger>("Logger");
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
