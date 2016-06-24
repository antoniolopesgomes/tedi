import * as express from 'express';
import * as http from 'http';
import {Router} from '../../router';
import {App} from '../../app';
import {Logger} from '../../logging';
import {Module, BindingContext, injectable} from '../../modules';
import {Config} from '../../config';
import {Promise} from '../../core';
import {WinstonLoggerFactory} from '../../logging/winston';
import {DefaultRouter} from '../../router/default';
import {ExpressApp} from '../../server/express';

@injectable()
export class ExpressServer extends Module {

    private _server: http.Server;

    init(): void {
         this
            .setComponent<Module>('Server', this, { context: BindingContext.VALUE })
            .setComponent<App>('App', ExpressApp)
            .setComponent<Router>('Router', DefaultRouter)
            .setComponent<Logger>('Logger', WinstonLoggerFactory())
            .setComponent<Config>('Config', {
                port: 8080
            }
            , { context: BindingContext.VALUE });
    }

    setConfig(config: Config): ExpressServer {
        this.setComponent<Config>('Config', config, { context: BindingContext.VALUE });
        return this;
    }

    getConfig(): Config {
        return this.component<Config>('Config');
    }

    getApp(): express.Application {
        return this.component<ExpressApp>('App').getApp();
    }

    run(): Promise<http.Server> {
        let config = this.component<Config>('Config');
        let logger = this.component<Logger>('Logger');
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
        let logger = this.component<Logger>('Logger');
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