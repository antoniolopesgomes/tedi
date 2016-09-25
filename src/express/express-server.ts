import * as express from "express";
import * as http from "http";

import {
    tedi,
    Logger,
    BaseModule,
    dependency,
    Config,
    Promise,
} from "../core";

import { WinstonLoggerFactory } from "../logger/winston-logger";
import { TediRouter, TediRouteActionsBuilder } from "../router";
import { ExpressAppBuilder } from "./express-app-builder";

@tedi.service()
export class ExpressServer extends BaseModule {

    private _server: http.Server;
    private _app: express.Application;

    constructor() {
        super();
    }

    public init(): void {
        // set dependencies
        this
            .dependencies(
                dependency("Server", { value: this }),
                dependency("ExpressAppBuilder", { class: ExpressAppBuilder }),
                dependency("Router", { class: TediRouter }),
                dependency("RouteActionsBuilder", { class: TediRouteActionsBuilder }),
                dependency("Logger", { class: WinstonLoggerFactory() }),
                dependency("Config", { value: { port: 8080 } })
            );
    }

    public setConfig(config: Config): ExpressServer {
        this.setDependency(dependency("Config", { value: config }));
        return this;
    }

    public getConfig(): Config {
        return this.getDependency<Config>("Config");
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
        let config = this.getDependency<Config>("Config");
        let logger = this.getDependency<Logger>("Logger");
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
        let logger = this.getDependency<Logger>("Logger");
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
