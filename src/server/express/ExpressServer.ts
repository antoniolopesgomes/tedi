import {
    Router,
    App,
    Logger,
    Module,
    BindingContext,
    injectable,
    Config
} from '../../core';
import {Promise} from '../../extensions';
import {WinstonLoggerFactory} from '../../logging/winston';
import {DefaultRouter} from '../../router/default';
import {ExpressApp} from '../../server/express';
import * as express from 'express';
import * as http from 'http';

@injectable()
export class ExpressServer extends Module {

    private _server: http.Server;

    init(): void {
         this
            .setComponent('Server', this, { context: BindingContext.VALUE })
            .setComponent(App, ExpressApp)
            .setComponent(Router, DefaultRouter)
            .setComponent<Logger>(Logger, WinstonLoggerFactory())
            .setComponent(Config, new Config({
                port: 8080
            })
            , { context: BindingContext.VALUE });
    }

    getApp(): express.Application {
        return this.component<ExpressApp>(App).getApp();
    }

    run(): Promise<http.Server> {
        let config = this.component<Config>(Config).getValue()
        let logger = this.component<Logger>(Logger);
        return new Promise<http.Server>((resolve, reject) => {
            this._server = this.getApp().listen(config.port, (error) => {
                return error ? reject(error) : resolve(this._server);
            });
        }).then((httpServer: http.Server) => {
            logger.debug(`Server running on port: ${config.port}...`);
            return this._server;
        })
    }

    stop(): Promise<any> {
        let logger = this.component<Logger>(Logger);
        return new Promise((resolve, reject) => {
            if (!this._server) {
                logger.debug('#stop called but no running server exists');
            }
            this._server.close((error) => {
                return error ? reject(error): resolve();
            })
        }).then(() => {
            this._server = null;
            logger.debug(`Server stopped`);
        })
    }

}