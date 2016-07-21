import * as express from 'express';
import * as http from 'http';
import {Router} from '../../router';
import {App} from '../../app';
import {Logger, WinstonLoggerFactory} from '../../logger';
import {BaseModule} from '../../module';
import {Service} from '../../service';
import {BindingContext, dependency} from '../../di';
import {Config} from '../../config';
import {Promise} from '../../core';
import {BaseRouter} from '../../router';
import {ExpressAppBuilder_v2} from './express-app-builder-v2';

@Service()
export class ExpressServer extends BaseModule {

    private _server: http.Server;
    private _app: express.Application;

    constructor() {
        super();
    }

    init(): void {
        //set dependencies
         this
            .dependencies(
                dependency('Server', { value: this }),
                dependency('ExpressAppBuilder', { class: ExpressAppBuilder_v2 }),
                dependency('Router', { class: BaseRouter }),
                dependency('Logger', { class: WinstonLoggerFactory() }),
                dependency('Config', { value: { port: 8080 } })
            );
    }

    setConfig(config: Config): ExpressServer {
        this.setDependency(dependency('Config', { value: config }));
        return this;
    }

    getConfig(): Config {
        return this.getDependency<Config>('Config');
    }

    getApp(): express.Application {
        if (!this._app) {
            let jsonRoutes = this.getJsonRoutes();
            let appBuilder = this.getDependency<ExpressAppBuilder_v2>('ExpressAppBuilder');
            this._app = appBuilder.buildApp(jsonRoutes, this);
        }
        return this._app;
    }

    run(): Promise<http.Server> {
        let config = this.getDependency<Config>('Config');
        let logger = this.getDependency<Logger>('Logger');
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
        let logger = this.getDependency<Logger>('Logger');
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