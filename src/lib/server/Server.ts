import {
    Router,
    App,
    Logger,
    Module,
    BindingContext,
    injectable,
    Config,
    ROUTER,
    CONFIG,
    APP
} from '../core';
import {WinstonLogger} from '../logging';
import {ExpressoRouter} from '../router';
import {ExpressApp, ExpressAppBuilder} from '../app/express';

const SERVER_SYMBOL = Symbol('Server');

@injectable()
export class Server extends Module {

    static get SYMBOL(): Symbol { return SERVER_SYMBOL; }
    
    constructor() {
        super();
        this
            .addComponent('Server', this, { context: BindingContext.VALUE })
            .addComponent('App', ExpressApp)
            .addComponent('Router', ExpressoRouter)
            .addComponent('Logger', WinstonLogger)
            .addComponent('Config', new Config({
                port: 8080
            })
            , { context: BindingContext.VALUE });
    }

}