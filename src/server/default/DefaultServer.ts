import {
    Router,
    App,
    Logger,
    Module,
    BindingContext,
    injectable,
    Config
} from '../../core';
import {WinstonLogger} from '../../logging';
import {DefaultRouter} from '../../router';
import {ExpressApp, ExpressAppBuilder} from '../../app/express';

@injectable()
export class Server extends Module {
    
    constructor() {
        super();
        this
            .addComponent('Server', this, { context: BindingContext.VALUE })
            .addComponent(App, ExpressApp)
            .addComponent(Router, DefaultRouter)
            .addComponent(Logger, WinstonLogger)
            .addComponent(Config, new Config({
                port: 8080
            })
            , { context: BindingContext.VALUE });
    }

}